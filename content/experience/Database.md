---
title: "Why Every Backend Engineer Eventually Ends Up Learning 7 Different Databases"
date: "2026-07-30"
tags: ["databases", "distributed-systems"]
excerpt: "MongoDB, PostgreSQL, Elasticsearch, Redis, ClickHouse, Prometheus, Cassandra — what each one is actually willing to sacrifice to be fast at its one job, and why the answer always comes back to where its storage engine pays: at write time, at read time, or in how bytes sit on disk."
---

# Why Every Backend Engineer Eventually Ends Up Learning 7 Different Databases

Our production stack at one point looked like this: MongoDB for application data, Redis for caching, Elasticsearch for search, Prometheus for metrics, ClickHouse for analytics.

Five databases. Not because someone wanted to pad an architecture diagram — every one of them showed up to solve a problem the others were bad at.

---

## There is no "best" database

The mistake I made early on was comparing databases that were never solving the same problem in the first place.

| Need | Database |
|---|---|
| User data | MongoDB / PostgreSQL |
| Cache | Redis |
| Search | Elasticsearch |
| Analytics | ClickHouse |
| Metrics | Prometheus |
| Massive writes | Cassandra |
| Global KV | DynamoDB |

The right question was never "which one is faster." It's what each one is willing to sacrifice to be fast at its one job.

Once I started paying attention, that sacrifice always fell into the same three buckets: every database is choosing whether it pays its cost during writes, during reads, or in how it lays data out on disk. B-trees pay at write time — rebalancing, page splits — so that reads stay cheap. LSM-trees pay later, during compaction and multi-file reads, so that writes stay cheap. Column stores give up cheap single-row updates so that scans across a column are nearly free. Search engines give up row-level retrieval entirely and optimize for "which documents contain this token" instead. None of that is a flaw in any of these systems — it's the actual design decision, and everything else below is a consequence of it.

---

## MongoDB: documents are easy, scaling them isn't

For a schema that kept changing shape, Mongo was genuinely one of the easier databases to work with. Adding a field didn't mean a migration. Embedding related documents meant most reads were a single fetch.

The problems started once traffic grew. We had a standalone instance, and as more aggregation queries got added, slow queries started sitting on connections for seconds at a time. The app wasn't CPU-bound — the connection pool was just exhausted.

The fix wasn't query-by-query optimization. It was moving to a replica set and routing expensive analytics reads to secondaries while writes kept hitting the primary.

```
      Primary
         │
   ┌─────┴─────┐
Secondary   Secondary
```

That one architectural change cut down more production incidents than any individual query rewrite did.

**A smaller fix that mattered more than it should have:** we were running `count()` and `find()` back to back for paginated results — two full collection scans for one page of data. Switching to `$facet` collapsed that into a single scan that returns both the page and the total count:

```javascript
db.logs.aggregate([
  {
    $facet: {
      data: [{ $match: {...} }, { $skip: 20 }, { $limit: 20 }],
      total: [{ $count: "count" }]
    }
  }
])
```

We also leaned on capped collections for rolling logs — Mongo evicts the oldest documents automatically once the collection hits its size limit, so there's no separate cleanup job to maintain.

### How Mongo indexes actually work

Mongo's default index type is a **B-tree** — the same structure Postgres and most relational databases use. The reason it's the default isn't arbitrary: a B-tree keeps keys in sorted order across a balanced tree, so both an exact match (`_id: 123`) and a range (`createdAt: { $gte: ... }`) resolve in roughly logarithmic time. A hash index would be faster for exact matches, but it can't answer a range query at all — you'd have to scan.

The cost shows up on writes. Every insert has to find the correct leaf, and if that leaf is full, it splits and rebalances. This is why the earlier advice "indexes are free reads" is only half true — every additional index is also additional write amplification on every insert and update.

### Where sharding comes in

A replica set solves *read* scaling — you're spreading query load across secondaries. It doesn't solve *write* scaling or dataset-size scaling, because every secondary still holds a full copy of the data. That's what sharding is for: splitting the collection itself across multiple replica sets, each holding a slice of the data, with a router (`mongos`) directing each query to the right shard based on a **shard key**.

We never actually needed to cross that line — the replica set carried us further than I expected. But it's worth understanding because a bad shard key is a much harder mistake to walk back than a bad index. Pick a monotonically increasing field like a timestamp or auto-incrementing ID as your shard key, and every new document lands on the same shard — you've built a distributed system that still writes to one machine. A good shard key needs enough cardinality and even enough distribution that writes actually spread across the cluster.

---

## PostgreSQL: the database that refuses to lose your data

The Mongo section above is really a story about pushing relationships out of the database — into the application, or into an embedded document. Postgres takes the opposite bet: relationships live inside the database, enforced with foreign keys and resolved with joins. Neither is universally correct. Embedding optimizes for developer speed and read locality; foreign keys optimize for a guarantee you'd otherwise have to hand-roll and get wrong at least once. It's worth naming that up front, because the rest of Postgres follows from taking that guarantee seriously — starting with **MVCC**, Multi-Version Concurrency Control.

Run `UPDATE users SET name = 'Aryan'` and Postgres doesn't overwrite the row in place. It writes a new version of it. Readers who started before the update keep seeing the old version; the writer works on the new one. That's why reads almost never block on writes in Postgres.

The tradeoff is that old row versions — dead tuples — pile up until `VACUUM` reclaims them. Skip vacuuming on a high-write table for long enough and you'll watch table bloat and query latency climb together.

### B-trees, and why Postgres bothers with other index types at all

Postgres's default index — like Mongo's — is a B-tree, and for the same reason: it supports both equality and range queries in roughly `O(log n)`, and it returns results in sorted order for free, which is why `ORDER BY` on an indexed column is often nearly instant.

What surprised me is how many *other* index types Postgres ships because a B-tree doesn't fit every access pattern — GIN for "does this array or JSONB field contain X," BRIN for huge append-only tables where per-block ranges are enough, GiST for geometric or full-text queries where "closest" isn't a sortable comparison at all.

The lesson underneath all of it: an index isn't free acceleration, it's a structural bet on how you're going to query the data. Bet wrong and you're maintaining a second data structure that speeds up almost nothing.

### Sharding, or the lack of it

Postgres doesn't shard natively. A single Postgres instance scales up (bigger machine, more read replicas) more gracefully than it scales out. If you outgrow a single primary's write throughput, your real options are an extension like Citus, manual application-level sharding, or moving the workload to a database built to shard from the start. This is one of the more honest tradeoffs in the Postgres ecosystem — it optimizes hard for correctness and durability, and horizontal write scaling is the thing it asks you to solve yourself.

---

## Elasticsearch isn't a database — it's a search engine

That distinction matters more than it sounds. Elasticsearch doesn't store data to answer transactional queries; it builds an **inverted index** — instead of mapping document → words, it maps word → documents, which is what makes searching across millions of documents feel instant.

The part that caught me off guard was how "near real-time" actually works. A successful write isn't immediately searchable. Documents land in an in-memory buffer first, and only on the next refresh (roughly every second by default) do they get written into a Lucene segment and become visible to search. Fine for a dashboard. Not fine if you need a write to be searchable the instant it's acknowledged.

The one fact that explains most of Elasticsearch's other quirks is that **segments are immutable** — once written, never edited in place. A "delete" doesn't remove anything immediately; it just flags the document in a bitset until a merge comes along. Merges are what eventually combine small segments and reclaim that space. And every merge means rewriting data that hadn't changed at all, which is real write amplification hiding behind what looks like a simple `DELETE` call.

**Deep pagination is the other trap.** `from: 100000` still forces Elasticsearch to sort the first hundred thousand results before it can return the next page — the cost scales with how deep you paginate, not how many results you actually want. `search_after` turns pagination into a cursor instead of a repeated scan, and it's what we ended up moving our search layer to.

---

## Redis is much more than a cache

Quick correction before anything else: Redis isn't purely in-memory the way most people assume. RDB snapshots and an append-only file let it replay writes after a crash — it's just that durability is still a real notch below something like Postgres that fsyncs on every transaction.

Redis became our "fast memory," and caching turned out to be the easy use case. The lesson that actually mattered was **hot keys**.

Picture one key — `user:elon` — absorbing 90% of the traffic that hits the cluster. Redis Cluster shards data across 16,384 hash slots to spread load, but sharding only helps if your *access pattern* is distributed, not just your *keys*. One sufficiently popular key can pin all that traffic to a single node while the rest of the cluster sits idle. The bottleneck isn't Redis in that case — it's your key design.

---

## ClickHouse made analytics feel free

Transactional databases are built to update individual rows efficiently. Analytical databases are built to scan millions of them. ClickHouse gets there by storing data **column-wise** instead of row-wise — a query like `SELECT avg(cost)` only has to read the `cost` column off disk, not every column in the table. That's the entire reason a query that takes seconds in a row-store can finish in milliseconds here.

The default table engine, MergeTree, pushes the same bet further. Instead of a B-tree indexing every row, it keeps a **sparse primary index** — one entry per few thousand rows, not per row — because with data already sorted and stored contiguously, a coarse index is enough to jump to roughly the right block and scan from there. New inserts land as separate parts, and a background process merges them over time — that's the "Merge" in MergeTree, the same shape of tradeoff as Cassandra's compaction below. Add heavy compression, since columns of similar values compress far better than mixed rows, and lightweight data-skipping indexes that let a query discard whole blocks whose min/max values can't match the filter, and the speed here has almost nothing to do with clever query planning and almost everything to do with never touching data it didn't need to.

---

## Prometheus: metrics aren't logs with fewer words

```
your services (expose /metrics)
        │
        ▼
   Prometheus  ── scrapes on an interval ──▶  stores as time series
        │
        ▼
    PromQL queries
```

The detail people remember Prometheus for is that it's a **pull** model — it scrapes targets on a schedule instead of waiting for them to push metrics in. That inversion matters more than it looks: a scrape that fails tells you a target is down, cleanly, instead of leaving you guessing why a push never arrived.

Underneath that, it's built around a question that's easy to conflate with logging but isn't the same one. Logs tell you *what happened*. Metrics tell you *how often it's happening*. Prometheus stores compressed time-series samples rather than generic documents, which is why a query like "CPU usage, last 30 days" is cheap even at high resolution.

The failure mode is cardinality. Every unique combination of labels creates a new time series, and storing millions of unique label combinations is a reliable way to bring a Prometheus server down. It's efficient specifically because it assumes label sets are bounded — violate that assumption and the efficiency disappears.

---

## Cassandra: the database built to never stop accepting writes

I haven't run Cassandra at the scale I've run the databases above, but the two ideas underneath it are worth knowing regardless, because they show up in almost every write-heavy distributed system.

**Writes go through an LSM-tree, not a B-tree.** Instead of finding the right spot in a sorted tree on disk (which means random I/O), Cassandra appends the write to a commit log and an in-memory structure called a memtable — pure sequential I/O. When the memtable fills up, it's flushed to disk as an immutable file called an SSTable. Over time, a background process called compaction merges SSTables together and discards overwritten or deleted data. The tradeoff is on the read side: a value might exist in the memtable or in any of several SSTables, so reads need bloom filters to figure out which files are worth checking at all. Cassandra is trading read complexity for write throughput — the exact opposite bet a B-tree makes.

**Sharding is the default, not an escape hatch.** Cassandra uses consistent hashing to place data around a ring of nodes based on a partition key, and each node owns several small ranges of that ring (virtual nodes) rather than one large contiguous chunk — that's what lets the cluster rebalance smoothly when nodes are added or removed. This is also why partition key choice matters as much as Mongo's shard key does: a poorly chosen key creates a hot partition the same way a poorly chosen shard key creates a hot shard.

Good for enormous write throughput. Weak for joins or ad-hoc queries — you design your tables around the queries you'll run, not the other way around.

**DynamoDB** leans on the same consistent-hashing idea, fully managed — you don't run the ring yourself, but a bad partition key still piles traffic onto one partition exactly the way a bad shard key does anywhere else.

---

## My biggest takeaway

Three years ago the question I asked was "which database should I learn." Now it's "what is this system refusing to be good at, and can I live with that."

Mongo trades joins for schema flexibility. Redis trades durability for speed. Elasticsearch trades immediate consistency for search performance. Cassandra trades read simplicity for write throughput. Postgres trades horizontal write scaling for transactional guarantees.

None of them are competing with each other. They're each optimized for a shape of problem, and the actual skill is recognizing which shape you're holding before you pick the tool.