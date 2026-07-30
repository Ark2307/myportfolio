---
title: "Why Every Backend Engineer Eventually Ends Up Learning 7 Different Databases"
date: "2026-07-30"
tags: ["databases", "distributed-systems"]
excerpt: "Every database is choosing whether it pays its cost during writes, during reads, or in how bytes sit on disk. Once I started reading them that way, picking one stopped being a comparison and started being a question about which cost I could absorb."
---

# Why Every Backend Engineer Eventually Ends Up Learning 7 Different Databases

Our production stack at one point ran MongoDB for application data, Redis for caching, Elasticsearch for search, Prometheus for metrics, and ClickHouse for analytics.

Five databases. Not to pad an architecture diagram. Every one showed up because the others were bad at something.

## There is no "best" database

The mistake I made early was comparing databases that were never solving the same problem.

The useful question isn't which one is faster. It's what each one is willing to sacrifice to be fast at its one job.

Once I started paying attention, that sacrifice always fell into the same three buckets. Every database is choosing whether it pays its cost during writes, during reads, or in how it lays data out on disk. B-trees pay at write time, rebalancing and splitting pages, so reads stay cheap. LSM-trees pay later, during compaction and multi-file reads, so writes stay cheap. Column stores give up cheap single-row updates so that scans across one column are nearly free. Search engines give up row retrieval entirely and optimize for "which documents contain this token."

None of that is a flaw. It's the design decision, and everything below is a consequence of it.

## MongoDB: documents are easy, scaling them isn't

For a schema that kept changing shape, Mongo was genuinely easy to work with. Adding a field didn't mean a migration. Embedding related documents meant most reads were one fetch.

The problems started when traffic grew. We had a standalone instance, and as aggregation queries piled up, slow queries began sitting on connections for seconds at a time. The app wasn't CPU-bound. The connection pool was exhausted.

The fix wasn't query-by-query optimization. It was moving to a replica set and routing expensive analytics reads to secondaries while writes kept hitting the primary.

```
      Primary
         │
   ┌─────┴─────┐
Secondary   Secondary
```

That one architectural change prevented more production incidents than any individual query rewrite.

A smaller fix that mattered more than it should have: we were running `count()` and `find()` back to back for paginated results, which is two full collection scans to render one page. `$facet` collapses it into a single scan that returns both the page and the total:

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

We also used capped collections for rolling logs, since Mongo evicts the oldest documents once the collection hits its size limit and there's no cleanup job to maintain.

The one thing I'd correct in how I used to talk about indexes: "indexes make reads free" is half a sentence. Mongo's default index is a **B-tree**, the same structure Postgres uses, because it answers both exact matches and ranges in roughly logarithmic time. It pays for that on every write, finding the right leaf and splitting it when it's full. Each additional index is write amplification on every insert and update, so an index is a bet on an access pattern rather than a free speedup.

### Where sharding comes in

A replica set solves read scaling. It does nothing for write scaling or dataset size, because every secondary holds a full copy. Sharding splits the collection across multiple replica sets, with `mongos` routing by **shard key**.

We never needed to cross that line, and the replica set carried us further than I expected. It's still the decision I'd think hardest about, because a bad shard key is much harder to walk back than a bad index. Pick a monotonically increasing field like a timestamp or auto-incrementing ID and every new document lands on the same shard, which is a distributed system that writes to one machine.

## PostgreSQL: the database that refuses to lose your data

The Mongo section is really about pushing relationships out of the database. Postgres takes the opposite bet: relationships live inside it, enforced with foreign keys, resolved with joins. Embedding optimizes for developer speed and read locality; foreign keys optimize for a guarantee you'd otherwise hand-roll and get wrong at least once.

Everything else about Postgres follows from taking that guarantee seriously. `UPDATE users SET name = 'Aryan'` doesn't overwrite the row, it writes a new version, so readers that started before the update keep seeing the old one. That's **MVCC**, and it's why reads almost never block on writes. The cost is dead tuples piling up until `VACUUM` reclaims them, and skipping vacuum on a high-write table makes bloat and query latency climb together.

What made the "index as a bet" framing click for me is how many index types ship with it, each because a B-tree doesn't fit some access pattern. GIN for "does this JSONB field contain X." BRIN for huge append-only tables where per-block ranges are enough. GiST for geometric queries where "closest" isn't a sortable comparison at all.

And it doesn't shard natively. Outgrow a primary's write throughput and your options are Citus, application-level sharding, or a different database. That's the most honest tradeoff in the ecosystem: Postgres optimizes hard for correctness and hands you horizontal write scaling as homework.

## Elasticsearch is a search engine, not a database

Elasticsearch doesn't store data to answer transactional queries. It builds an **inverted index**, mapping word to documents rather than document to words, which is what makes searching millions of documents feel instant.

What caught me off guard is that an acknowledged write isn't immediately searchable. Documents land in an in-memory buffer and only enter a Lucene segment on the next refresh, roughly every second by default. Fine for a dashboard, not fine if you need a write searchable the instant it's confirmed.

The one fact that explains most of the rest is that **segments are immutable**. A delete flags the document in a bitset rather than removing it, and a later merge combines segments and reclaims the space. Every merge rewrites data that didn't change, so there's real write amplification hiding behind a simple `DELETE`.

Deep pagination is the other trap, and the one that cost us. `from: 100000` forces Elasticsearch to sort the first hundred thousand results before returning the next page, so cost scales with depth rather than page size. `search_after` turns pagination into a cursor, and it's what we moved our search layer to.

## Redis is more than a cache

A correction first, because I believed the wrong thing here for a while: Redis isn't purely in-memory. RDB snapshots and an append-only file let it replay writes after a crash. Durability is a notch below Postgres fsyncing per transaction, but "loses everything on restart" is not accurate.

The lesson that mattered was **hot keys**. Redis Cluster shards across 16,384 hash slots, but sharding only helps if your *access pattern* is distributed, not just your *keys*. One popular key pins its traffic to a single node while the rest of the cluster idles, and the shapes are recognizable: a global feature-flag blob every request reads, a rate-limit counter for your largest tenant, a leaderboard everyone polls. The bottleneck isn't Redis, it's key design, and the fix is splitting the key rather than adding nodes.

## ClickHouse made analytics feel free

Transactional databases are built to update individual rows. Analytical databases are built to scan millions of them. ClickHouse stores data column-wise, so `SELECT avg(cost)` reads the `cost` column off disk and nothing else. That alone is why a query taking seconds in a row store finishes in milliseconds here.

MergeTree, the default engine, pushes the same bet further: a **sparse primary index** with one entry per few thousand rows rather than per row, since sorted contiguous data only needs a coarse pointer to the right block; new inserts landing as separate parts that a background process merges later, which is the same tradeoff shape as Cassandra's compaction below; heavy compression, which works far better on a column of similar values than on mixed rows; and data-skipping indexes that discard whole blocks whose min/max can't match the filter.

None of that is clever query planning. It's four mechanisms for never touching data the query didn't need, and the price is paid in how badly ClickHouse handles a single-row update.

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

Prometheus scrapes targets on a schedule instead of waiting for pushes, and that inversion matters more than it looks: a failed scrape tells you a target is down, cleanly, instead of leaving you to guess why a push never arrived.

Logs tell you what happened. Metrics tell you how often it's happening. Prometheus stores compressed time-series samples rather than documents, which is why "CPU usage, last 30 days" is cheap at high resolution.

The failure mode is cardinality, and it's the one I'd warn someone about before anything else. Every unique combination of labels creates a new series, so putting a user ID or a request ID in a label is how people take their own Prometheus down. It's efficient precisely because it assumes label sets are bounded.

## Cassandra: built to never stop accepting writes

I haven't run Cassandra at the scale I've run the databases above, but the two ideas underneath it show up in almost every write-heavy distributed system.

**Writes go through an LSM-tree, not a B-tree.** Rather than finding the right spot in a sorted on-disk tree, which is random I/O, Cassandra appends to a commit log and an in-memory memtable, which is sequential. A full memtable flushes as an immutable SSTable, and compaction later merges SSTables and discards overwritten data. Reads pay for it: a value might live in the memtable or in any of several SSTables, so reads need bloom filters to decide which files are worth opening. Read complexity traded for write throughput, the exact inverse of the B-tree bet.

**Sharding is the default, not an escape hatch.** Consistent hashing places data around a ring by partition key, and each node owns several small ranges rather than one contiguous chunk, which is what lets the cluster rebalance when nodes join or leave. A bad partition key creates a hot partition exactly the way a bad shard key creates a hot shard. DynamoDB uses the same idea fully managed, and a bad partition key still piles traffic onto one partition there.

Good for enormous write throughput, weak for joins and ad-hoc queries, because you design tables around the queries you'll run rather than the other way around.

## The list I actually use

Mongo trades joins for schema flexibility. Redis trades durability for speed. Elasticsearch trades immediate consistency for search performance. ClickHouse trades cheap updates for cheap scans. Prometheus trades detail for bounded cost. Cassandra trades read simplicity for write throughput. Postgres trades horizontal write scaling for transactional guarantees.

None of them compete with each other. Each is optimized for a shape of problem, and the skill is recognizing which shape you're holding before you pick the tool. When I'm evaluating one now, I'm not asking what it's good at. I'm asking what it's refusing to be good at, and whether I can absorb that.
