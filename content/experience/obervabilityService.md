---
title: "Six AI Agents, Three Ways to Find a Message ID"
date: "2026-07-12"
tags: ["ai-infrastructure", "observability"]
excerpt: "Claude, Cursor, Copilot, Codex, Gemini and LangChain do not agree on what a message is. Normalizing them collapsed into three strategies: trust the agent's id, borrow one from a file it wasn't meant to share, or invent your own and persist a counter."
---

# Six AI Agents, Three Ways to Find a Message ID

Our customers stopped asking whether we could capture AI traffic and started asking what was in it. Which employees used which agents, what the conversations were, what each interaction cost.

We already supported six agents (Claude, Cursor, Copilot, Codex, Gemini, LangChain) with installers hooked into each, capturing every request and response and shipping it to our backend. Capture wasn't the problem.

Every request was stored as an independent event. No sessions, no message ordering, no tool-call spans. And to hold storage down we retained only the latest ten samples per user, so a customer trying to understand how their team used AI was looking at ten disconnected fragments. The job was turning independent requests into conversations you could search and walk through.

## Six agents don't agree on what a message is

The assumption to break first is that there's a standard representation of a conversation. There isn't. Some agents hand you a stable message identifier on every event. Some expose only a session id. Some expose nothing you can build on.

Everything downstream needed the same normalized record regardless of source: session ID, conversation ID, message ID, timestamp, user, span.

Supporting any single agent was easy. The engineering problem was making sure the seventh integration would be another adapter rather than another redesign.

Across six agents, identity resolution collapsed into three strategies. The question was never "what's the message ID," it was "how would we even find one for this agent."

### Trust it

Cursor was the easy case. Every hook invocation already carried a stable identifier for the current turn, so we propagated it.

### Borrow it

Claude exposes no message identifier through its hooks, but it maintains its own local transcript. We read the latest entry from that transcript and reuse its identifier for the current event.

This is the decision in the system I'm least comfortable with, and I'd still make it again. That transcript is an internal file, not an interface. Nobody promised us its format, its location, or that the last entry corresponds to the event our hook just fired on. It works, and it can break on any Claude update without warning, which makes it a maintenance liability we accepted deliberately rather than a clever trick. The alternative was putting Claude in the "invent it" bucket below and losing the ability to correlate our events with Claude's own record of the same conversation, which was worth more than the stability we gave up.

### Invent it

Copilot and Gemini were hardest: a stable session identifier, nothing identifying an individual message, and no secondary source to borrow from. Codex and LangChain landed in the same bucket, so all four fall back to generating our own message identifiers from a per-session counter.

That sounds trivial until you remember every hook invocation is stateless. Each event arrives with no memory of previous requests, so the counter can't live in process memory. It has to be persisted and recovered between invocations or numbering silently drifts, and silently is the operative word: a broken counter produces plausible-looking message ordering that's wrong, which is worse than an error.

What made this reusable was hiding all three strategies behind one abstraction. Storage, search and the dashboard never learn whether an identifier came from the agent, from a transcript, or from us. They consume one event shape.

## Batching fixed one bottleneck and created another

Every incoming event originally triggered a direct write to Elasticsearch.

The first optimization was obvious: each tenant's aggregator accumulates events in memory and flushes every five seconds or every hundred events, whichever comes first. That cut network overhead substantially.

It also moved the problem rather than solving it. Instead of many small writes, every tenant was now issuing concurrent bulk writes against the same cluster. Under sustained load Elasticsearch couldn't drain them fast enough and the shared write service started exhausting resources. We'd traded a request-volume problem for a concurrency problem, and the second one was worse, because a saturated write path fails in a way that loses data while a chatty one merely wastes bandwidth.

Kafka went in between:

```text
Aggregator
    │
    ▼
Kafka (partitioned by tenant)
    │
    ▼
Consumers
    │
    ▼
Elasticsearch
```

Partitioning by tenant preserves ordering within a tenant's stream while absorbing bursts. Consumers write into Elasticsearch at a rate the cluster sustains, so peaks buffer instead of dropping.

Worth being precise about what this bought, because "we added Kafka" is not an explanation. Kafka didn't make the cluster faster. It made the ingest path's failure mode a queue depth rather than a dropped write, which is the tradeoff we wanted: we chose availability with eventual consistency, so a customer seeing their data thirty seconds late is fine and a customer not seeing it at all is not.

## Elasticsearch over ClickHouse

ClickHouse looked like the obvious choice at first. We were ingesting something that resembled logs.

But customers weren't asking "show me every request from yesterday." They wanted to search for a specific prompt, find every conversation for a user, filter sessions across several fields, and walk an interaction start to finish.

That's a search workload, not an analytical one. ClickHouse is excellent at scanning a column across millions of rows and it isn't what you want for "find the session containing this phrase." Elasticsearch won on the shape of the question, not on ingest characteristics.

The next choice was granularity, and this one is a genuine fork.

We store **one document per span**. Every LLM invocation and every tool call is its own document, and there is no session document anywhere in the index. A session exists only implicitly, as the set of spans sharing a session identifier.

The alternative is a session-level document that accumulates token counts, models, users and metadata as spans arrive. Reads get very cheap. Every write then needs merge logic, read-before-write semantics, and concurrency handling on a document that multiple spans are racing to update.

We kept writes append-only and pushed that complexity into the query layer. I'd make the same call again for one reason: an append-only write path has no correctness bugs available to it. A merge-on-write path has several, and they'd surface as quietly wrong token counts rather than as errors.

## Reconstructing conversations at query time

Since sessions aren't stored, the dashboard rebuilds them.

The session list groups spans with a `terms` aggregation on the session identifier, and nested aggregations compute token counts, models used and span counts from the matching spans. Nothing is maintained at ingest; the dashboard computes what it needs when someone asks.

Opening a session is simpler: filter by session identifier, sort spans chronologically. Every span already carries a timestamp and a duration, so the conversation and its execution trace fall out of the ordering.

The two views paginate differently. Session browsing uses `search_after`, because deep offset pagination in Elasticsearch gets more expensive the further you go as the engine skips results internally. Carrying forward the last document's sort values keeps cost flat regardless of scroll depth. Individual session views are naturally bounded and don't need it.

That's the cost of the append-only decision, stated plainly: every session-list page view pays for aggregations that a session document would have precomputed. We're paying at read time on purpose, and if the session list ever becomes the slow part of the product, the fix is a materialized session document and the concurrency problems that come with it. It hasn't, so we haven't.
