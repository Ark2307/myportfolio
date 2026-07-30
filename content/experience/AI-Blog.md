---
title: "Nobody Tunes the Recursion Limit"
date: "2026-07-26"
tags: ["ai-infrastructure"]
excerpt: "Across six agents in a vulnerability scanner, the number I spent the most time on was never a model parameter. It was recursion_limit. The fallback for hitting it exists in exactly one of the six."
---

# Nobody Tunes the Recursion Limit

Our source-code vulnerability scanner runs about six agents. Finding global middlewares, resolving a function definition, tracing a call path: each one is the same LangGraph prebuilt ReAct loop with a different prompt and a different tool list.

In two years on that codebase I have changed a model parameter maybe twice. I have changed `recursion_limit` constantly, and I still don't think we have it right.

That number caps how many reason-act-observe cycles an agent gets before the framework kills the run. It reads like plumbing. It is the knob that decides whether an agent finds the answer, quits halfway through a call chain, or spends forty tool calls circling a file it already read.

## The cap is a property of the search space, not the model

The three that matter in our system are nowhere near each other. One agent runs comfortably in single digits. Another needs the high twenties. One particularly deep lookup is capped closer to a hundred.

Same model, same framework, same ReAct implementation. The spread is entirely about how far each agent's search can legitimately spread before it should be considered lost. Middleware discovery either finds the framework's registration point in a handful of steps or it is looking in the wrong directory. Following a tainted parameter through a call graph can genuinely need thirty hops, and telling that agent to stop at ten produces a confident, wrong, half-traced answer rather than an error.

So there is no default worth copying. Every number here came from watching an agent fail and deciding whether it failed because it was lost or because we cut it off. That is a slow, unglamorous loop, and it produced more improvement than any prompt rewrite I've done.

## We ship RAG without a reranker, on purpose

Reranking is presented almost everywhere as a default stage: embed, vector search, rerank, then generate. Our retrieval layer skips it. We return top-N chunks straight off cosine distance.

I want to be clear that this is a decision and not an oversight, because the case for reranking is real. Vector search over-fetches deliberately, tuned for recall rather than precision, so some of what comes back is only loosely related to the query. Hand a model five tangential chunks alongside the two that answer the question and it does not reliably know which is which. It starts blending details across them, or asserting something that only half-appeared in the source. A reranker scores query and candidate together instead of comparing embeddings in isolation, and prunes the set down to what is load-bearing.

We don't have that stage because retrieval has not been our limiting factor. Output quality in this system tracks the agent's reasoning loop far more closely than it tracks which chunks arrived. Adding a cross-encoder buys latency and another model dependency to fix a problem we are not currently having. It is the first thing I would add the moment retrieval quality becomes the bottleneck instead of the LLM, and I would be able to tell, because that failure has a signature: findings that cite the wrong file.

Skipping a recommended stage is a defensible engineering position when you can name the metric that would reverse the decision. Skipping it because you never considered it is not.

## Retrieval is a tool call, not a pipeline stage

The other thing we did differently is where retrieval sits. It is not a step the orchestrator runs before invoking the model. It is a tool, exposed alongside "read a file" and "query the code graph," and the agent decides when a question needs a semantic search rather than a structural one.

What makes that work is metadata. Each repository gets its own vector collection, so a search can never pull context from an unrelated codebase. Within a collection, every chunk is stored under an id built from its file path, its position in the chunking order, and the exact line range it spans. A hit is therefore not just "this text looked similar." It is a pointer to specific lines.

That matters because retrieval isn't the end of the flow here. A match becomes an observation fed back into the reasoning loop, carrying its cosine distance alongside the content, and the agent needs to act on where a result came from as much as what it says. Without the line range it would have to re-derive location from raw text, which is exactly the kind of step where a model quietly guesses.

The related lesson, which cost us nothing to learn but is worth stating: more tools made our agents worse. A larger tool list means a larger decision space to search on every single cycle. A small, well-defined set outperformed a sprawling one, and it interacts directly with the recursion limit, because every wasted tool selection spends a cycle from the budget.

## The part I got wrong

Bounding the loop is only half the job. You also have to decide what happens when an agent hits the ceiling.

Right now, exactly one of our six agents wraps its execution step in a fallback. If it throws for exceeding the recursion or context limit, it gets re-invoked with a "summarize what you have" prompt, so it still returns something structured instead of nothing.

The other five don't. They fail silently to an empty response.

That is not a design decision, it is drift. The pattern was written once, copied across six call sites, and then improved in one of them. Nobody removed the safety behavior from the other five; it just never existed there, and an empty response looks enough like a clean negative result that it went unnoticed for a long time. An agent that finds no vulnerabilities and an agent that died at step 27 return the same thing to the caller.

The fix is not interesting. The reason it went undetected for months is: we had bounded every loop, so the box was checked, and we never asked what the boundary did when it was reached. Reliability work has this shape more often than not. The guard gets built, the guard gets copied, and the copies quietly stop being guards.
