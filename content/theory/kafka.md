---
title: "You Don't Need Kafka Internals. You Need Four of Them."
date: "2026-05-22"
tags: ["distributed-systems", "databases"]
excerpt: "Every Kafka guide hands you the same nine-row config table. In practice almost every failure I've debugged came down to four things: the log's shape, two timeouts people conflate, the rebalance tax, and the fact that auto-commit is a correctness bug with a config flag."
---

# You Don't Need Kafka Internals. You Need Four of Them.

There is a genre of Kafka post that ends in a table of nine configs with a one-word justification each. `acks: all` — "Durability." `min.insync.replicas: 2` — "Quorum writes." I've read a lot of those tables and I don't think they've ever helped me, because six of the nine rows are just the default restated, and the two that matter are the ones a table can't explain.

What has helped is understanding four things. Everything below is one of them.

## 1. The log's shape explains every other design decision

Kafka's only real abstraction is the **commit log**: an append-only, ordered sequence of records. A topic is a named log. A partition is a shard of that log.

On disk, a partition is a directory of **segment files**. A segment rolls when it crosses a size threshold (`log.segment.bytes`, default 1GB) or a time one (`log.roll.hours`, default 168h). Each segment carries an index mapping offsets to byte positions inside it.

That's why reads are fast: random access to any offset is one index lookup and then a sequential read. Sequential disk I/O is orders of magnitude cheaper than random I/O, and Kafka is designed around that single fact. Almost every constraint you'll hit later is downstream of it. You can't query Kafka arbitrarily because there is no structure to query. Consumers track a position rather than receiving a delivery because a position is just an integer into a log.

The one variant worth knowing is **log compaction**, where Kafka retains only the latest record per key instead of deleting by age:

```
Before:  [user:1, v1] [user:2, v1] [user:1, v2] [user:3, v1] [user:2, v2]
After:   [user:1, v2] [user:2, v2] [user:3, v1]
```

A compacted topic behaves like a durable key-value store you can replay from the beginning, which is what makes change data capture and state materialization work. A tombstone (key with a null value) marks a deletion, and the compactor eventually removes both the tombstone and everything before it for that key.

## 2. There are two consumer timeouts and everyone conflates them

This is the one that has cost me the most time, and it's the reason I'd rank it above anything in the producer.

- `session.timeout.ms` (default 45s) is the **heartbeat** timeout. A background thread sends heartbeats; miss them and the coordinator declares you dead.
- `max.poll.interval.ms` (default 5 minutes) is the **processing** timeout. It measures the gap between successive `poll()` calls.

These are different clocks measuring different things, and a consumer can be perfectly healthy on one while failing the other. If your handler takes six minutes, Kafka evicts you for being dead while your heartbeat thread is still cheerfully reporting in. The eviction triggers a rebalance, the rebalance stops the group, the group reassigns partitions, your replacement picks up the same slow message, and takes six minutes on it too.

That's not hypothetical. It's exactly the rebalance storm we hit while parallelizing a test-execution pipeline, and the writeup of how we got out of it is in [Kafka, Parallel Consumers, and the 6-Hour Testing Bottleneck](/blog/boostingTesting). The short version: the fix wasn't tuning the timeout upward. It was bounding how long a single unit of work could take, so the processing clock became something we controlled rather than something the slowest API in the batch controlled.

If you tune one thing on a consumer, tune `max.poll.interval.ms` to a number you can actually defend, then enforce that number in your own code.

## 3. Rebalancing is a throughput tax, and the assignor is how you lower it

Every consumer group has a **group coordinator**, a broker chosen by hashing the group ID, which handles membership, rebalances and offset commits. When a consumer joins it sends `JoinGroup`; the coordinator waits for all members, elects the first to join as group leader, and that leader runs the assignment algorithm and returns the result via `SyncGroup`.

The part worth internalizing is what a rebalance costs. Under the classic eager protocol, all consumers stop processing, revoke every partition, rejoin, and resume. Throughput goes to zero for the duration. In a group where rebalances are frequent, that's not a blip, it's your steady state.

Of the built-in assignors, only two are decisions rather than defaults. **StickyAssignor** minimizes partition movement, which is what you want the moment consumers hold any local state, because a reassignment otherwise throws that state away. **CooperativeStickyAssignor** goes further and rebalances incrementally: only the partitions that need to move are revoked, and everything else keeps processing. It removes the stop-the-world pause rather than shortening it.

On Kafka 2.4 and later I don't see an argument for the eager protocol. RangeAssignor and RoundRobinAssignor are worth knowing so you can recognize them in someone else's config, not so you can choose them.

## 4. Auto-commit is a correctness bug that ships as a config flag

Offsets live in `__consumer_offsets`, an internal compacted topic that runs on the same log machinery as everything else. Committing an offset asserts: *I have processed everything up to and including this position.*

With `enable.auto.commit=true`, the consumer commits on a timer. Which means it will, eventually, assert that claim about a message it hasn't finished processing. On a restart you either skip data or reprocess it, depending on where the timer happened to fire. There is no configuration of the timer that makes the assertion true, because the timer isn't correlated with your work.

Manual commits fix it by putting the commit where the claim becomes true: after processing. The standard shape is `commitAsync()` during normal operation, because it doesn't block, and `commitSync()` on shutdown, because that's the one commit you cannot afford to lose. `commitAsync()` deliberately doesn't retry, since retrying with a stale offset would overwrite a newer commit.

The only case for auto-commit is a consumer where reprocessing and skipping are both harmless. If that's genuinely true, you probably didn't need Kafka's ordering guarantees either.

## The two things I'd think hardest about before enabling

**Durability on the producer.** `acks=all` with `min.insync.replicas=2` means the leader and at least one in-sync follower have confirmed a write before you get an ack, and it costs roughly 1.5–2x write latency. That's the price of not losing data when a leader dies mid-write, and I'd pay it by default. Its necessary companion is `unclean.leader.election.enable=false`: leaving unclean election on means Kafka may elect a replica that was never in the ISR, trading your data for availability without telling you.

**Exactly-once.** It needs three things simultaneously: the idempotent producer, transactions, and `isolation.level=read_committed` on the consumer. `sendOffsetsToTransaction` is what makes it real, committing consumer offsets and output records atomically. It also costs somewhere around 20–30% of your throughput. That's a fine trade when duplicates are genuinely unacceptable, and a bad one when your consumer could have been made idempotent instead. Ask which of those you're in before turning it on, because a downstream dedup key is usually cheaper than a transactional pipeline.

Kafka is a durable, ordered, replayable log. It is not a job queue, not a database, and not a broker with dead-letter semantics. Everything else is what you build on top, and the four internals above are the ones that determine whether what you build survives a slow consumer.
