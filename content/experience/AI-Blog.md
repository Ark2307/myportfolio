---
title: "Building AI Systems: What Actually Happens When You Send a Prompt"
date: "2026-07-26"
tags: ["ai-infrastructure"]
excerpt: "A walkthrough of what actually happens between a prompt going in and an answer coming out — prompt engineering, tokenization, RAG retrieval, planning, ReAct agents, tools, and MCP — drawn from building a vulnerability scanner and an autonomous red-teaming orchestrator."
---

# Building AI Systems: What Actually Happens When You Send a Prompt

A developer asks an AI assistant to find every SQL injection vulnerability in a repository and explain how each one could be exploited. From where they're sitting, this looks like a single instruction. Underneath, it's anything but — that one line passes through prompt construction, tokenization, retrieval, planning, and a tool-calling loop before anything resembling an answer comes back.

I've spent the last couple of years building production AI systems — a source-code vulnerability scanner, and more recently, an autonomous red-teaming orchestrator. Neither project taught me much about transformers or attention mechanisms; there's already no shortage of writing on that. What they did teach me is what actually happens in the gap between a prompt going in and an answer coming out, and how much of the real engineering work lives in that gap rather than in the model itself.

That's what this post walks through.

## The Journey of a Prompt

At a high level, a single request moves through a chain that looks roughly like this:

```
                    User Prompt
                         │
                         ▼
              Prompt Engineering
                         │
                         ▼
                 Context Builder
                         │
       ┌─────────────────┴──────────────────┐
       │                                     │
       ▼                                     ▼
Tokenization                          RAG Retrieval
                                             │
                                       Embeddings
                                             │
                                       Vector Search
                                             │
                                         Re-ranker
                                             │
                                             ▼
                                   Retrieved Context
                                             │
                     ────────────────────────┘
                         │
                         ▼
                     Planner
                         │
                         ▼
                     ReAct Agent
                         │
                  Needs a Tool?
                  │           │
                 No          Yes
                  │           ▼
                  │     MCP Client
                  │           │
                  │     MCP Server
                  │           │
                  │      Tool Result
                  └───────────┘
                         │
                         ▼
                  Final Response
```

Every stage in that chain is doing real work. Let's go through them one at a time.

## 1. Prompt Engineering: Defining the Scope

When I started working with LLMs, I assumed the model saw exactly what the user typed. In production systems, that's rarely the case. By the time a request actually reaches the model, the application has usually built something far richer around it — a role definition, task constraints, an output format, the tools available, repository metadata, and often the reasoning carried over from earlier steps in the same session.

For the vulnerability scanner, a user might type something as simple as "find authentication vulnerabilities." Internally, that single line became one small part of a much larger structured prompt: a role ("you are an application security engineer"), explicit boundaries ("do not assume missing code"), a defined output format, and whatever context the model needed to stay grounded instead of speculating.

That's the part that changed how I think about prompt engineering. It was never really about writing cleverly worded instructions. It's about narrowing the space the model is allowed to operate in, so there's less room for it to guess.

## 2. Tokenization: The Language Models Actually Read

Before any of that reaches the model, it gets broken into tokens rather than passed through as raw text. A token might be a whole word, a fragment of one, a number, or a piece of punctuation — the model was trained on these units, not on strings. This is also why context windows and API pricing are measured in tokens instead of characters; the token count, not the character count, is what the model is actually working with.

## 3. Retrieval (RAG): Giving the Model the Right Context

The vulnerability scanner's hardest problem was never generating explanations — it was making sure the model looked at the right parts of the codebase before it started reasoning at all. That's the job Retrieval-Augmented Generation (RAG) does: retrieve the relevant material first, then let the model generate against it, instead of asking it to rely purely on what it picked up during training.

A production retrieval pipeline usually looks something like this: a query gets converted into an embedding, that embedding is used to pull the top candidates from a vector database, those candidates get filtered by metadata and passed through a reranker, and only the highest-scoring handful — typically five to ten documents — actually make it into the prompt.

The vector database step is deliberately loose. Documents are split into chunks, and each chunk is converted into an embedding — a high-dimensional numerical representation of its meaning — using an embedding model. The user's query goes through the same embedding model, and similarity search (cosine similarity, HNSW, or approximate nearest neighbour methods, depending on the setup) pulls back whatever looks close. This first pass is tuned to maximize recall, not precision, so it tends to over-fetch on purpose.

That's exactly why reranking matters. Vector similarity finds documents that are *related* to a query, which isn't the same as finding the ones that actually answer it. Ask "how does JWT authentication work?" and a vector search might hand back the JWT middleware, the OAuth documentation, the auth README, the login controller, and the session management guide — all genuinely related, but not equally useful. A reranker looks at the query and each candidate document together, rather than comparing embeddings in isolation, and scores how relevant each one actually is. Depending on the system, that scoring step might be a cross-encoder model, a lightweight classifier, or even another LLM call for more complex ranking. It adds latency, but it consistently improves what actually reaches the model.

It's worth being precise about a distinction that gets blurred a lot: semantic search and RAG aren't the same thing. Semantic search is the retrieval layer — embeddings, vector search, filtering, reranking. RAG is the full system: semantic search plus prompt augmentation, so the model generates its answer using both what it learned during training and what was just retrieved for this specific query. In the vulnerability scanner, this distinction wasn't academic — the quality of the agent's output tracked the quality of the retrieval pipeline far more closely than it tracked the choice of model. Our own retrieval layer actually skips reranking entirely and returns top-N chunks straight off cosine distance, which is a deliberate tradeoff rather than an oversight: it's fast and simple, and it's also the first place I'd add a reranking stage if retrieval quality ever became the bottleneck instead of the LLM.

There's also a metadata layer doing quiet but important work underneath the embeddings themselves. Each repository gets its own vector collection, so a search never accidentally pulls context from an unrelated codebase. Within that collection, every chunk is stored under an id built from its file path, its position in the chunking order, and the exact line range it spans — so a hit in vector space isn't just "this text looks similar," it's a direct pointer back to a specific file and a specific set of lines. That distinction matters because retrieval isn't the last step here — a match becomes an observation fed straight back into the agent's reasoning loop, riding alongside its cosine distance from the query, and the agent needs to act on where a result came from as much as what it says. The whole thing is wrapped as a single callable tool rather than a manual lookup step, so the model itself decides when a question needs a semantic search instead of a structural one, and the metadata attached to each hit is what lets it jump straight to the right lines afterward instead of re-deriving location from raw text.

Worth knowing about even outside this specific pipeline: where a reranking stage does exist, it earns its keep mainly by cutting down hallucination, not just by improving relevance scores. Vector search over-fetches on purpose, so some of what it pulls back is only tangentially related to the query. Hand a model five loosely-related chunks alongside the two that actually answer the question, and it doesn't reliably know which is which — it can start blending details across chunks, or stating something with confidence that only half-appeared in the source. A reranker sitting between retrieval and generation prunes that noise down to the handful of chunks that are actually load-bearing, so the model ends up reasoning over signal instead of picking a path through clutter. That's a cheap lever against a specific, common failure mode, which is why reranking shows up as a near-default in production RAG systems even in cases like this one, where it wasn't the right tradeoff to add.

## 4. Planning: Breaking a Large Problem Down

Even with the right context in hand, complex problems don't hold up well to a single model call. This is where agent frameworks like LangGraph earn their keep — instead of asking the model to solve everything in one shot, the problem gets broken into smaller, executable steps.

Even with the right context in hand, complex problems don't hold up well to a single model call. This is where agent frameworks like LangGraph earn their keep: instead of asking the model to solve everything in one shot, the goal gets decomposed up front into a sequence of concrete steps, and the model works through them one at a time instead of trying to reason about the whole problem at once.

In the vulnerability scanner, that decomposition looks like: find the backend directories, detect the framework and language, find the global middlewares, then work through each API in turn. Some of those steps turn out to need further steps of their own once the agent actually starts working through them — but that's a separate problem from planning itself, and it's what ReAct, below, is built to handle.

## 5. ReAct: Reason, Act, Observe, Repeat

The reasoning loop behind most modern agents follows the ReAct pattern — reason, then act, then observe, then repeat. Where planning decides the sequence of steps up front, ReAct decides, moment to moment inside a step, what to do next given what's just come back: which tool to call, what the result means, and whether that's enough to move on.

In LangGraph, this is the framework's own prebuilt ReAct agent. Given a set of tools — read a file, query the code graph, search the vector index — the model picks one, reads what it returns, and loops until it's satisfied or the current step is done. We reuse this same shape across roughly half a dozen agents in the scanner, each just swapping in a different prompt and tool list for its specific job: finding middlewares, resolving a function definition, tracing a call path.

The lesson that mattered most here was that none of these loops can be left unbounded, and tuning the limit turned out to be more art than science. One agent runs comfortably within single digits, another needs the high twenties, and one particularly deep lookup is capped closer to a hundred, depending on how far that agent's search space can realistically spread. Bounding the loop isn't enough on its own, either — you also have to decide what happens when it hits that ceiling. Right now, exactly one of these agents wraps its execution step in a fallback: if it throws for hitting the recursion or context limit, it gets re-invoked with a "just summarize what you have" prompt, so it still returns something structured instead of failing outright. The rest don't have that yet — they fail silently to an empty response instead. Which is its own lesson: a pattern copy-pasted across six call sites tends to drift, and a safety behavior you add in one place quietly doesn't exist in the other five until you go looking for it.

## 6. Tools: Extending What an LLM Can Do

On its own, an LLM can only reason over whatever's already in its context window. It can't inspect a repository, query a database, hit an API, or read your docs — tools are what give it access to any of that: reading files, executing SQL, searching documentation, calling other APIs, querying vector databases, even invoking another agent.

The counterintuitive lesson here is that more tools don't make a better agent. Hand an agent fifty tools and it usually gets slower and less reliable, simply because the decision space it has to search gets much bigger. A small, well-defined set of tools tends to outperform a sprawling one by a wide margin.

## 7. MCP: A Standard Way to Expose Tools

When an agent decides it needs something external, it doesn't reach into code directly — it talks to an MCP (Model Context Protocol) server. MCP is an open protocol from Anthropic that standardizes how AI clients discover and invoke external capabilities, built on top of JSON-RPC 2.0.

The client first asks what the server can do:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

And gets back something like:

```json
{
  "result": {
    "tools": [
      {
        "name": "read_file",
        "description": "Read a file from disk",
        "inputSchema": {
          "type": "object",
          "properties": {
            "path": { "type": "string" }
          }
        }
      }
    ]
  }
}
```

Once the model picks a tool, the client invokes it through `tools/call`. Beyond tools, MCP servers can also expose resources (read-only context like docs or config), prompts (reusable templates a client can request), and sampling — a newer capability that lets a server request additional model generations as part of a controlled workflow. Part of why MCP has caught on as fast as it has is that it removes the need for every IDE or framework to invent its own tool interface — they all speak the same protocol instead.

## 8. LangChain and LangGraph

On the vulnerability scanner, we leaned on both LangChain and LangGraph, and even though they're usually mentioned in the same breath, they're solving different problems. LangChain provides the higher-level building blocks — prompt templates, document loaders, embeddings, retrievers, output parsers. LangGraph sits a layer above that, modeling AI workflows as graphs with nodes, edges, shared state, and cycles, which makes planners, multi-agent systems, and long-running reasoning loops far easier to build than they'd be as a single sprawling prompt. In practice, most production agents benefit far more from explicit workflow orchestration than from an increasingly elaborate prompt trying to do the same job.

## 9. What the Second Project Taught Me

The vulnerability scanner taught me how agents reason. The red-team orchestrator taught me how to make them reliable — and that turned out to be a different set of problems entirely: context management, prompt design, guardrails, tool reliability, evaluation. Building AI systems, I've come to think, was never really about picking a better model. It's about designing a system that keeps behaving predictably even when the model underneath it doesn't.

## Final Thoughts

The biggest thing I've taken from the last couple of years is that an AI application is a lot more than an LLM with a nice prompt. It's retrieval pipelines, planners, tools, protocols, validation layers, orchestration, and guardrails, all working together — the model is just one component in that stack, and often not the hardest one to get right.

As models keep improving, I don't think the edge is going to come from calling a slightly more powerful API. It's going to come from building better systems around whatever model you're using. That's the part of this work I find genuinely interesting.