---
title: "Kafka Internals: What Every Engineer Should Actually Know"
date: "2026-05-22"
tags: ["distributed-systems", "databases"]
excerpt: "A ground-up explanation of how Kafka actually works — log segments, consumer groups, ISR, offset management, exactly-once semantics, and the tradeoffs hiding beneath every configuration knob."
---

Most engineers learn Kafka by writing a producer and a consumer, watching messages flow, and calling it done. That works — until something breaks at 3am and you need to understand *why*.

This is the internals guide I wish I had before production failures taught me the hard way.

## The Log: Everything Starts Here

Kafka's foundational abstraction is the **commit log** — an append-only, ordered sequence of records. A topic is just a named log. A partition is a shard of that log.

```
Partition 0:  [offset 0] [offset 1] [offset 2] [offset 3] → ...
Partition 1:  [offset 0] [offset 1] [offset 2]             → ...
Partition 2:  [offset 0] [offset 1]                        → ...
```

On disk, each partition is a directory of **segment files**. A segment rolls over when it hits a size threshold (`log.segment.bytes`, default 1GB) or a time threshold (`log.roll.hours`, default 168h). Each segment has a corresponding index file mapping offsets to byte positions within the segment.

This structure is why Kafka reads are so fast: random access to any offset requires one index lookup, then one sequential read. Sequential disk I/O is orders of magnitude faster than random I/O — Kafka is designed entirely around this fact.

### Log Retention vs. Log Compaction

Two retention modes:

**Time/size-based retention** — the default. Segments older than `log.retention.hours` (or larger than `log.retention.bytes`) are deleted. Simple and predictable, but you lose history.

**Log compaction** — Kafka retains only the *latest* record per key. Earlier values for a key are garbage-collected during compaction, but the latest value is kept forever. This makes a compacted topic behave like a key-value store — useful for change data capture and materializing state.

```
Before compaction:
[user:1, v1] [user:2, v1] [user:1, v2] [user:3, v1] [user:2, v2]

After compaction:
[user:1, v2] [user:2, v2] [user:3, v1]
```

A tombstone record (key with null value) signals deletion — the compactor will eventually remove both the tombstone and any earlier record for that key.

## Producer Internals: Batching, Acks, and Ordering

### The Accumulator

When your code calls `producer.send()`, the record does not immediately go to the broker. It lands in an in-memory **RecordAccumulator** — a per-partition queue of batch buffers. A background I/O thread (`Sender`) drains these batches and sends them to the appropriate broker.

`linger.ms` (default 0) controls how long the sender waits to accumulate more records before sending. Setting `linger.ms=5` is often enough to dramatically improve throughput by allowing natural batching — at the cost of 5ms added latency.

### Acknowledgment Levels

`acks` is the single most important producer config:

| `acks` | Meaning | Risk |
|---|---|---|
| `0` | Fire and forget | Loss on any failure |
| `1` | Leader acknowledges | Loss if leader dies before follower replication |
| `all` / `-1` | All ISR members acknowledge | Safest, ~1.5-2x latency |

`acks=all` with `min.insync.replicas=2` is the production-safe combination for data that matters.

### Idempotent Producer and Sequences

The idempotent producer (`enable.idempotence=true`) assigns each message a **sequence number** per partition. The broker deduplicates retries by checking if the sequence was already committed. This prevents the classic at-least-once → duplicate problem without requiring any application-level dedup.

Idempotence is scoped to a single producer session. If the producer restarts, it gets a new producer ID (PID) and sequence restarts from zero — old dedup state is irrelevant.

## Consumer Groups and Partition Assignment

### The Group Coordinator

Every consumer group has a **group coordinator** — a broker elected by hashing the group ID. The coordinator manages:
- Membership (join/leave)
- Rebalances
- Offset commits

When a consumer joins, it sends a `JoinGroup` request. The coordinator waits for all members, then elects a **group leader** (the first consumer to join). The leader runs the partition assignment algorithm and sends the result back to the coordinator via `SyncGroup`.

### Assignment Strategies

Three built-in strategies:

**RangeAssignor** — assigns contiguous ranges of partitions per topic. Consumer 0 gets partitions 0-1, Consumer 1 gets partitions 2-3. Simple but creates imbalance with multiple topics.

**RoundRobinAssignor** — distributes partitions round-robin across consumers. More balanced, but a consumer joining/leaving triggers a full reassignment.

**StickyAssignor** — minimizes partition movement during rebalances. Consumers keep their current partitions where possible. This is the right choice for stateful consumers (e.g., those that maintain local aggregation state).

**CooperativeStickyAssignor** — an incremental rebalance protocol. Only partitions that *need* to move are revoked; everything else continues processing. This eliminates the "stop the world" rebalance pause. Use this in Kafka 2.4+.

### The Rebalance Tax

Every rebalance is a coordination storm. All consumers stop processing, revoke their partitions, rejoin the group, and resume. During this window, throughput drops to zero.

Common rebalance triggers:
- Consumer joins or leaves
- Consumer fails to poll within `max.poll.interval.ms`
- Consumer fails to send heartbeat within `session.timeout.ms`

The distinction between these two timeouts matters: `session.timeout.ms` is the heartbeat timeout (default 45s), and `max.poll.interval.ms` is the processing timeout (default 5 minutes). If your processing takes 6 minutes, Kafka thinks the consumer is dead — even if it's alive and heartbeating.

This is exactly the rebalance storm we hit in our [parallel consumer case study](/blog/BoostingTesting).

## The ISR: In-Sync Replicas

Each partition has one **leader** and zero or more **followers**. Only the leader handles reads and writes. Followers replicate from the leader.

The **ISR (In-Sync Replicas)** is the set of replicas that are sufficiently caught up with the leader. A replica falls out of ISR if it falls more than `replica.lag.time.max.ms` (default 30s) behind.

When the leader fails, a new leader is elected from the ISR. This is why `acks=all` with `min.insync.replicas=2` is durable — both the leader and at least one follower have confirmed the write before the producer gets an ack.

```
Normal state:
  Leader:     [0][1][2][3][4]
  Follower A: [0][1][2][3][4]  ← in ISR
  Follower B: [0][1][2][3]     ← catching up, in ISR if within lag threshold
```

If all replicas in the ISR die, Kafka can optionally allow **unclean leader election** — electing a replica that wasn't in ISR. This recovers availability at the cost of data loss. Disable this (`unclean.leader.election.enable=false`) for anything that matters.

## Offset Management

Offsets are stored in the internal `__consumer_offsets` topic — a compacted Kafka topic that itself uses Kafka's log infrastructure.

When you commit an offset, you're recording: "I have successfully processed all messages up to and including this offset." On restart or rebalance, the consumer fetches its committed offset and resumes from there.

Two commit modes:

**Auto-commit** (`enable.auto.commit=true`) — the consumer commits on a timer (`auto.commit.interval.ms`). Easy but dangerous: you may commit an offset before the message is fully processed, or process a message without committing, causing duplicates or loss on restart.

**Manual commit** — you explicitly call `commitSync()` or `commitAsync()` after processing. `commitSync()` blocks and retries on failure. `commitAsync()` is non-blocking but doesn't retry (retrying with stale offsets would override a newer commit). The standard pattern is: `commitAsync()` during normal operation, `commitSync()` on shutdown.

## Exactly-Once Semantics (EOS)

True exactly-once in Kafka requires three things working together:

1. **Idempotent producer** — eliminates producer-side duplicates from retries
2. **Transactions** — atomic write across multiple partitions/topics
3. **`isolation.level=read_committed`** on the consumer — hides uncommitted transactional messages

A transactional producer writes a **transaction marker** (commit or abort) to every partition involved in the transaction. Consumers with `read_committed` only expose records up to the last stable offset (LSO) — the offset before any open transaction.

```java
producer.initTransactions();
producer.beginTransaction();
producer.send(new ProducerRecord<>("output-topic", key, value));
producer.sendOffsetsToTransaction(offsets, consumerGroupMetadata);
producer.commitTransaction();
```

`sendOffsetsToTransaction` atomically commits the consumer offsets and the output records in the same transaction. If the producer dies before `commitTransaction()`, the transaction is aborted and the records are invisible to `read_committed` consumers.

EOS has a real cost: ~20-30% throughput reduction vs. non-transactional producers. Use it only when duplicates are genuinely unacceptable.

## Configuration Knobs That Actually Matter

| Config | Safe production value | Why |
|---|---|---|
| `acks` | `all` | Durability |
| `min.insync.replicas` | `2` | Quorum writes |
| `enable.idempotence` | `true` | No producer duplicates |
| `max.poll.interval.ms` | Match your processing SLA | Avoid false rebalances |
| `session.timeout.ms` | `30000`–`45000` | Fail fast on dead consumers |
| `auto.offset.reset` | `earliest` (for new groups) | Don't silently skip data |
| `unclean.leader.election.enable` | `false` | No data loss on leader fail |
| `linger.ms` | `5`–`20` for throughput, `0` for latency | Batching control |
| `compression.type` | `lz4` or `zstd` | ~5x compression, minimal CPU |

## What Kafka Is Not

Kafka is not a job queue. It has no concept of "job completed" or priority. It is not a database — you can't query it arbitrarily. It is not a replacement for a message broker with dead-letter queues and retry semantics (though you can build those patterns on top of it).

It is a **durable, ordered, replayable event log**. Everything else is what you build on top.

Understanding the log, the ISR, the consumer group protocol, and offset management puts you in a position to debug production failures, tune performance, and design systems that remain correct under failure — not just under happy-path conditions.
