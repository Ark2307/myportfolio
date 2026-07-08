---
title: "Building an AI Security Engineer Before Coding Agents Could Do It"
date: "2025-10-20"
tags: ["security", "ai-infrastructure"]
excerpt: "How I built a hybrid static-analysis + semantic-search + LLM pipeline to automatically find vulnerabilities in source code — and why none of it was really a model problem."
---

# Building an AI Security Engineer Before Coding Agents Could Do It

*Looking back at designing an LLM-powered static analysis system in 2024.*

---

Onboarding a new customer to our API security platform often took more than a week, because we first had to wait for production traffic.

Working at an AI-powered API security startup, that delay was the whole problem — and fixing it turned into something far more interesting than it first appeared.

Our platform continuously discovered APIs from production traffic and analyzed them for security vulnerabilities. It worked well once traffic started flowing, but onboarding new customers was slow. Before a customer saw their first vulnerability report, they typically had to involve DevOps teams, configure networking, complete compliance reviews around production traffic, and wait for enough requests to reach our platform. In practice, that meant one to two weeks just to start seeing real-time traffic — and for services with non-trivial auth setups, mapping the authentication context correctly could add another two to three days on top of that.

We wanted a different onboarding experience. Instead of waiting for runtime traffic, what if we could analyze the source code directly and produce meaningful security findings within minutes?

That immediately split the project into two independent problems: discover APIs from source code, and discover vulnerabilities from source code. I worked on the second.

At first glance, it sounded like a perfect use case for an LLM. It wasn't.

---

## The First Prototype Failed

The first solution was the obvious one: give the repository to an LLM, ask it to find vulnerabilities. The model produced plausible-looking answers, but they weren't reliable enough to build a product around.

Initially, we blamed context limits — production repositories simply didn't fit into the available context windows. But after experimenting more, we realized context length wasn't actually the biggest issue.

The real problem was that security reasoning is inherently distributed. A single API request passes through authentication middleware, authorization checks, controllers, services, repositories, database queries, and sometimes messaging systems before returning a response. No single file contains enough information to answer a question like *"Is this endpoint vulnerable to Broken Object Level Authorization?"* Authentication might happen in one middleware, ownership validation inside a service, database access somewhere else entirely. Even if the entire repository fit inside a prompt, expecting a model to reconstruct execution paths across thousands of files was unrealistic.

The problem wasn't context. The problem was information retrieval. Instead of asking the model to understand an entire repository, we needed to reconstruct only the execution path relevant to a particular API.

The repository already contained every answer we needed. The challenge wasn't generating new knowledge — it was collecting the right evidence before asking the model to reason.

That became the guiding principle behind the entire architecture.

---

## Designing Around How Code Actually Executes

One decision simplified almost everything that followed: instead of treating a repository as a collection of files, we decided to analyze it the same way a request flows through an application.

```
                    Repository
                         │
                         ▼
          Detect Backend & Framework
                         │
                         ▼
          Discover Global Middlewares
                         │
                         ▼
          Resolve Local Middlewares
                         │
                         ▼
             Build Execution Path
                         │
                         ▼
         Collect Security Evidence
                         │
                         ▼
        Vulnerability-Specific Analysis
```

Every stage existed to reduce uncertainty before the next one ran. "Collect Security Evidence" was where the system gathered the concrete facts a vulnerability check would need — which sinks were reachable, which validations ran, in what order — so the final reasoning step wasn't guessing from scratch.

By the time an LLM was asked whether an endpoint was vulnerable, the system already knew which framework the project used, how authentication was implemented, which middleware ran before the controller, where sensitive sinks existed, and which parts of the codebase actually mattered. Rather than making one large reasoning call, we broke the problem into several much smaller ones. That single shift improved both accuracy and cost.

The hard part wasn't making the model smarter. It was asking it smaller questions.

---

## Static Analysis Solved Half the Problem

Our first instinct was to lean heavily on traditional static analysis. Using code property graphs, we could answer structural questions with high confidence: where is this method defined, which functions call it, can user-controlled data reach a dangerous sink, what does the control flow look like. Those answers are deterministic, and for problems like taint analysis and call-graph traversal, static analysis is extremely effective.

Unfortunately, security isn't only about structure. Suppose a repository contains fifteen middleware implementations. Static analysis can identify every one of them. It cannot reliably answer which one actually authenticates users — that's not a structural question, it's a semantic one. Static analysis understands syntax. It doesn't understand intent.

---

## LLMs Solved the Other Half

Naturally, we explored the opposite direction: index the repository semantically and let an LLM reason over retrieved code. That solved retrieval remarkably well — searching for "authentication middleware" or "JWT validation" became straightforward.

But semantic similarity doesn't understand execution. Two functions can look almost identical while behaving completely differently, and ownership validation might happen three function calls before a database query. Embeddings retrieve related code; they don't reconstruct execution paths.

Neither approach solved the whole problem on its own. One understood structure. The other understood intent. The architecture only started making sense when we stopped choosing between them.

---

## A Hybrid Architecture

The final system combined three complementary capabilities: static analysis answered structural questions, semantic search answered retrieval questions, and an LLM reasoned over the evidence both systems collected.

Instead of asking the model to explore an entire repository, we asked it much smaller, well-scoped questions — does this middleware authenticate users, is ownership validated before the database is reached, does user-controlled input reach a dangerous sink, is authentication missing entirely. The model became a reasoning engine instead of a search engine, and that distinction made a bigger difference than any single prompt-engineering trick we tried.

AI wasn't replacing static analysis. Static analysis was teaching AI where to look.

---

## Middleware Discovery Became an Agent

One particularly interesting problem was middleware discovery. I initially expected this to be another sequential pipeline. It wasn't.

Every framework organizes middleware differently. Some projects have one authentication layer; others distribute security checks across decorators, filters, shared libraries, and helper functions. There isn't a fixed number of steps required to answer "how is authentication implemented in this repository?" — so this wasn't a pipeline problem, it was a search problem.

Instead of hardcoding every possibility, we built an iterative planning loop:

```
             User Goal
                 │
                 ▼
            Planner
                 │
                 ▼
         Execute Current Step
        (Static Analysis +
         Semantic Search)
                 │
                 ▼
          Evaluate Result
                 │
        ┌────────┴────────┐
        │                 │
   Enough Evidence?       No
        │                 │
        ▼                 │
  Return Findings ◄────────┘
```

Each iteration gathered more evidence. The planner decided what was still missing, the executor collected it, and the evaluator decided whether confidence was high enough to stop or another pass was needed. Looking back, we had essentially built an AI agent before "AI agents" became the industry's favorite buzzword — not because they were trendy, but because the problem genuinely required iterative reasoning.

---

## Reading Execution Paths Instead of Files

Real business logic rarely lives inside controllers. Controllers call services, services call repositories, repositories call databases, and validation happens somewhere in between. Walking that call graph recursively quickly exceeded practical context limits.

Instead of caching raw source code, we cached structured summaries describing what each function actually did. Whenever another API traversed the same function, the system reused the summary instead of re-reading the implementation.

Caching structured summaries changed how the system scaled. Context usage grew with the number of unique execution paths, not with the size of the repository — so reasoning could go several layers deeper without the cost exploding the way raw-code traversal would have. The system accumulated knowledge, not code.

---

## Engineering Tradeoffs

This project taught me that AI systems are usually engineering problems disguised as model problems. Every architectural decision involved a tradeoff.

**Static analysis vs. LLM reasoning.** Static analysis was deterministic but rigid. LLMs were flexible but probabilistic. Combining them produced significantly better results than either alone.

**Precision vs. recall.** Code property graphs produced precise structural answers. Semantic search intentionally optimized for recall. The planner decided which one mattered more at each step of reasoning.

**Context size vs. reasoning depth.** Raw source code preserved detail but exhausted context windows fast. Summarizing execution paths sacrificed some fidelity in exchange for much deeper repository traversal — we deliberately optimized for depth over completeness.

**Fixed pipelines vs. adaptive workflows.** Traditional automation assumes every repository follows similar conventions. Real-world codebases don't. Replacing rigid workflows with iterative planning made the system far more resilient across languages and frameworks.

---

## Did It Actually Work?

Because we already had a runtime-analysis engine backed by roughly a thousand OWASP API Top 10 test cases, we could compare both approaches using exactly the same benchmark. Running those same test configurations against real traffic surfaced plenty of findings, but also enough false positives that triaging results became its own chore — every finding still needed a human to confirm it was real before anyone would act on it.

The source-code system was built specifically to avoid that failure mode: findings had to be backed by an actual reconstructed execution path, not a pattern match against traffic shape. Measured against the same test library, it surfaced 70% more valid vulnerabilities than the traffic-based approach — with zero false positives. Fewer results to distrust, more that were worth acting on immediately.

That gap is really the entire argument of this post in one data point. The traffic-based system was reasoning over surface patterns. The source-code system was reasoning over execution paths grounded in evidence. The second kind of reasoning doesn't just feel more rigorous — it measurably was.

---

## Looking Back

Perhaps my favorite part of this project is how it ended.

When we built this system in 2024, foundation models struggled with repository-scale reasoning. Context windows were smaller, tool use was unreliable, and understanding code across multiple files required substantial orchestration. Building a custom reasoning pipeline wasn't an optimization — it was the only practical way to solve the problem at all.

Over the following year, that changed quickly. Models got dramatically better at navigating repositories, reasoning across files, invoking tools, and holding long-context understanding. Coding agents evolved from intelligent autocomplete into systems that naturally performed much of the exploration our pipeline had been custom-built to do.

As the models improved, the tradeoffs changed with them. Maintaining a sophisticated orchestration layer no longer justified its own complexity, and eventually we retired the feature from production — not because it failed, but because the ecosystem had caught up to it.

Good systems aren't meant to last forever. They're built to solve the constraints of their time. When the technology evolves enough that a simpler solution replaces them, retiring complexity isn't failure. It's progress.