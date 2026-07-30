---
title: "Kafka, Parallel Consumers, and the 6-Hour Testing Bottleneck"
date: "2026-05-25"
tags: ["distributed-systems", "observability"]
excerpt: "We were running 70,000 security tests in about 6 hours on a shared queue, and I was explicitly not allowed to solve it by adding machines. What that constraint forced was per-message offset tracking, a hard 4-minute timeout, and a state file on disk."
---

# Kafka, Parallel Consumers, and the 6-Hour Testing Bottleneck

Our API security testing pipeline was the biggest bottleneck on the platform. A single run executed close to **70,000 deep security tests** and took roughly **6 hours**, on an execution queue shared across all customers. One enterprise client's suite would back up the line and every other customer's wait time went up with it.

The standard answer is horizontal scaling: isolated worker pools per customer, a distributed job architecture, aggressive autoscaling. I wasn't allowed to do that, because the infrastructure bill would have gone up roughly in proportion to the speedup, and the whole point was to not pay that.

That constraint is what makes this worth writing about. Being told to make it faster without adding machines meant the only lever left was how much work a single consumer could safely have in flight, and every problem below follows from pulling that lever.

## What one test does

```
[Pick Endpoint] → [Apply Attack Payload] → [Wait for Response] → [Analyze Behavior] → [Store Findings]
```

The lifecycle is simple; the timing distribution isn't. Some endpoints respond in milliseconds, some take 30 seconds, some never respond. That tail is the entire engineering problem.

Kafka was already the backbone: durable, replayable, partitioned. The question was never how to consume faster. It was how to run thousands of long-running unpredictable tasks concurrently without breaking Kafka's offset guarantees.

## Concurrency versus offset safety

The obvious approach is to consume a batch, hand it to a thread pool, and commit the highest offset. It works until a pod dies mid-batch.

Say 100 tests are in flight, 70 finished, 30 still running, and the pod takes an OOM kill. Commit early and the 30 incomplete tests are gone. Commit late, after the batch, and the 70 finished tests re-execute on restart. On a security platform that means the same vulnerability reported twice, inflated counts, and a report the customer stops trusting.

Both options are wrong because the batch is the wrong unit. Commits need to be per-message, and hand-writing that tracking across worker threads is a lot of state to get right. We used **Confluent's Parallel Consumer** instead:

```java
ParallelConsumerOptions<String, String> options =
    ParallelConsumerOptions.<String, String>builder()
        .consumer(consumer)
        .ordering(UNORDERED)
        .maxConcurrency(100)
        .commitMode(PERIODIC_CONSUMER_SYNC)
        .build();
```

The library tracks completion per record rather than per batch, so out-of-order completion is fine. If record 50 finishes before record 40, it holds the gap and only advances the committed offset to where it's genuinely safe. Choosing `UNORDERED` is a real tradeoff: we gave up per-partition ordering, which we could afford because each test is independent, and got the ability to let fast tests complete without waiting behind slow ones.

## Hanging endpoints, and why the timeout is the important number

The thing that hurt throughput wasn't expensive processing, it was unresponsiveness. Broken customer gateways, endpoints that accept a connection and then never reply.

With a concurrency limit of 100, it takes exactly 100 hung endpoints to occupy the pool completely. Throughput reaches zero and stays there. Kafka can't help with this; it's an application concern.

Every execution is wrapped in a timed future:

```java
Future<?> future = executor.submit(() -> runTest(message));

try {
    future.get(4, TimeUnit.MINUTES);
} catch (TimeoutException e) {
    future.cancel(true); // Interrupt the worker thread
    createTimedOutResult(message);
}
```

Past four minutes the task is cancelled, the thread returns to the pool, and an explicit `TEST_TIMED_OUT` result is persisted. Persisting it matters as much as the cancellation: customers need to see which tests timed out so they can go look at their own gateway, and a silent drop would have looked like a clean pass.

Something worth being precise about, because it's the part I got wrong when reasoning about this early on: the 4-minute timeout constrains wall-clock more than `maxConcurrency` does. Concurrency moves the ceiling, from one test at a time to a hundred. What you actually realize against that ceiling is bounded by the slowest item in the run. A single unbounded hang means the run never finishes regardless of how much parallelism you configured, so the timeout isn't a safety net bolted on beside the concurrency change. It's the thing that makes the concurrency change mean anything.

## The rebalance storm

A standard consumer has to call `.poll()` within `max.poll.interval.ms`. Exceed it and Kafka concludes the consumer is dead, revokes its partitions, and rebalances. Our tests ran for minutes, so to Kafka our consumer looked dead constantly: continuous rebalancing, partition thrashing, duplicate processing, throughput collapse.

The Parallel Consumer decouples heartbeating from execution. A lightweight background thread keeps the session alive while worker threads run long tasks independently. Through 4-minute attack simulations the group stayed stable.

Worth noting what the fix is *not*, because raising `max.poll.interval.ms` is what everyone reaches for first. Raising it makes Kafka wait longer before declaring a genuinely dead consumer dead, trading a rebalance problem for a stuck-partition problem. The generalized version is in [You Don't Need Kafka Internals. You Need Four of Them.](/blog/kafka)

## Two ways to stop, kept separate on purpose

A run ends by completing, by hitting a global timeout, or because a user clicked Cancel. Treating those identically was an early mistake: force-killing always lost valid in-flight results, and draining always meant a user-initiated cancel hung for minutes.

```java
if (isCancelled || maxTimeExceeded) {
    // Hard interrupt: the user is waiting on this
    executor.shutdownNow();
} else {
    // Graceful drain: let active work finish
    executor.shutdown();
    executor.awaitTermination(5, TimeUnit.MINUTES);
}
```

Natural completion preserves data. Manual cancellation feels immediate. Those are different requirements and they get different code paths.

## The startup race

The subtlest bug in the system. At startup, before Kafka has connected and delivered the first batch, the consumer evaluates its own state. A naive implementation sees `parallelConsumer.workRemaining() == 0`, reads it as "queue drained, work done," and shuts down before processing anything. In production that presented as worker pods crash-looping on boot.

```java
AtomicBoolean firstRecordRead = new AtomicBoolean(false);
```

The shutdown condition only activates after at least one record has been read. It's a one-line fix, and I'm including it because the class of bug is worth recognizing: "empty" and "not yet started" are different states, and any check that conflates them will fire during startup.

## Crash recovery across two phases

Concurrency inside a healthy JVM is the easy half. Surviving a container crash is the rest of it.

The pipeline runs two phases in the same container:

```
[Producer Phase: Generates Test Jobs] → [Consumer Phase: Executes via Kafka]
```

If the pod is evicted mid-run, restart has to know where it stopped. Without that, the producer phase runs again, pushes duplicate jobs into Kafka, and double-writes to MongoDB.

**In memory,** a thread-safe singleton (`TestingConfigurations.getInstance()`) loads attack configuration once at startup so 100 worker threads read from shared memory instead of each querying MongoDB.

**On disk,** a file on the container's persistent volume tracks phase progress:

```json
{
  "summaryId": "run_cfg_9921a",
  "CONSUMER_RUNNING": true
}
```

```
            [Service Starts]
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
[Recovery File Exists?]   [No File Found]
         │                     │
         ▼                     ▼
┌───────────────────┐   ┌───────────────────┐
│ SKIP Producer     │   │ Run Producer Phase│
│ Resume via Kafka  │   │ Write State File  │
└───────────────────┘   └─────────┬─────────┘
                                  ▼
                        ┌───────────────────┐
                        │ Start Consumer    │
                        └───────────────────┘
```

Two recovery mechanisms at two granularities: Kafka offsets recover message-level position, the state file recovers workflow-phase position. Neither substitutes for the other, which is why both exist.

Choosing a file on a persistent volume over a row in MongoDB was deliberate and is the decision I'd most expect an argument about. A database row is the cleaner answer and survives losing the volume. The file wins on the specific failure we cared about: it's readable during the boot sequence before any connection pool exists, so recovery doesn't depend on the thing that might have caused the crash. If the volume goes, we re-run the producer phase and eat the duplicates, and we decided that was the cheaper failure.

## What changed

| | Before | After |
|---|---|---|
| Tests in flight | 1 | 100 (`maxConcurrency`) |
| Offset tracking | batch-level | per-message |
| Hung endpoint | occupies a thread indefinitely | cancelled at 4 min, `TEST_TIMED_OUT` persisted |
| Rebalances under load | continuous | none; heartbeat decoupled from execution |
| Crash mid-run | producer re-runs, duplicate jobs | producer skipped via state file |
| Ordering guarantee | per-partition | none (`UNORDERED`) |

The last row is there on purpose. It's what we gave up, and any table that only lists what improved is selling you something.

The thing I'd carry to the next system is that none of the wins came from Kafka. Kafka gave us a durable ordered log and then held its position. Every problem in this post lived in the layer above it: how much work to admit, how long to let it run, what to do when it doesn't finish, and how to know on boot whether you already did it.
