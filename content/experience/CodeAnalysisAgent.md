---
title: "Building an AI Security Engineer Before Coding Agents Could Do It"
date: "2025-10-20"
tags: ["security", "ai-infrastructure"]
excerpt: "A hybrid static-analysis, semantic-search and LLM pipeline for finding vulnerabilities in source code, built in 2024 because no model could do it alone. We retired it a year later because they could."
---

# Building an AI Security Engineer Before Coding Agents Could Do It

*Looking back at designing an LLM-powered static analysis system in 2024.*

---

Onboarding a customer to our API security platform took more than a week, because we had to wait for their production traffic to reach us first.

Our platform discovered APIs from live traffic and analyzed them for vulnerabilities. That worked well once traffic flowed. Getting there was the problem: customers had to involve DevOps, configure networking, clear compliance review on production traffic, and then wait for enough requests to accumulate. One to two weeks before a first vulnerability report, and for services with non-trivial auth setups, another two to three days to map the authentication context correctly.

So: skip the traffic. Analyze the source directly and produce findings in minutes.

That split into two independent problems, discovering APIs from source and discovering vulnerabilities from source. I worked on the second.

## The first prototype failed

The obvious version first: hand the repository to an LLM and ask it to find vulnerabilities. The answers looked plausible and were not reliable enough to put in front of a customer.

We blamed context limits, since production repositories didn't fit in the context windows available then. That turned out to be the wrong diagnosis.

Security reasoning is distributed by nature. A single request passes through authentication middleware, authorization checks, controllers, services, repositories, database queries, sometimes a message bus, before it returns. No individual file holds enough information to answer *"is this endpoint vulnerable to Broken Object Level Authorization?"* Authentication happens in one middleware, ownership validation inside a service, database access somewhere else. Even with the whole repository in the prompt, expecting a model to reconstruct execution paths across thousands of files was unrealistic.

So the bottleneck was retrieval, not capacity. The repository already contained every answer we needed. The work was collecting the right evidence before asking the model anything.

## Designing around how code executes

One decision simplified everything after it: analyze a repository the way a request flows through it, rather than as a collection of files.

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

Every stage exists to reduce uncertainty before the next one runs. "Collect Security Evidence" is where the system gathers the concrete facts a check will need: which sinks are reachable, which validations ran, in what order.

By the time an LLM was asked whether an endpoint was vulnerable, the system already knew the framework, how authentication was implemented, which middleware ran before the controller, where the sensitive sinks were, and which parts of the codebase were irrelevant. Rather than one large reasoning call we made several small ones, each with a narrower question to answer. That improved accuracy and cost at the same time, which is rare enough to be worth noticing.

## Two halves, neither sufficient

Our first instinct was traditional static analysis. With code property graphs we could answer structural questions deterministically: where is this method defined, which functions call it, can user-controlled data reach a dangerous sink. For taint analysis and call-graph traversal it's hard to beat.

Security isn't only structural, though. Suppose a repository has fifteen middleware implementations. Static analysis finds all fifteen. Which one authenticates users is a semantic question, and a code property graph has nothing to say about it.

So we tried the opposite: index the repository semantically and let an LLM reason over what came back. Retrieval got much better; searching for "authentication middleware" or "JWT validation" became easy. But semantic similarity doesn't model execution. Two functions can look nearly identical and behave completely differently, and ownership validation might happen three calls before the database is touched. Embeddings retrieve related code, they don't reconstruct a path through it.

Each approach covered exactly what the other missed, which is why the architecture only started working once we stopped choosing between them. The final system runs static analysis for structural questions, semantic search for retrieval, and an LLM reasoning over the evidence both collected.

The model got small, well-scoped questions. Does this middleware authenticate users. Is ownership validated before the database is reached. Does user-controlled input reach a dangerous sink. Moving the model from search to reasoning did more for output quality than any prompt-engineering change we tried.

AI wasn't replacing static analysis. Static analysis was teaching AI where to look.

## Middleware discovery had to become an agent

I expected middleware discovery to be another sequential stage. It couldn't be.

Every framework organizes middleware differently. Some projects have a single authentication layer; others spread security checks across decorators, filters, shared libraries and helpers. There is no fixed number of steps that answers "how is authentication implemented in this repository?" That makes it a search, and searches need a loop.

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

Each iteration gathers more evidence. The planner decides what's still missing, the executor collects it, the evaluator decides whether confidence is high enough to stop. We had built an agent, in 2024, because the problem required iterative reasoning rather than because agents were interesting.

## Caching summaries, not source

Real business logic rarely lives in controllers. Controllers call services, services call repositories, repositories hit databases, and validation happens somewhere in between. Walking that call graph recursively blew past practical context limits fast.

So we cached structured summaries of what each function did, rather than its source. When another API traversed the same function, the system reused the summary.

That changed how the system scaled: context usage grew with the number of unique execution paths rather than with repository size, so reasoning could go several layers deeper without cost exploding.

## Tradeoffs

Every one of these went a specific direction, and I'd defend all four.

**Static analysis against LLM reasoning.** Deterministic but rigid, against flexible but probabilistic. We ran both, and let the planner decide which was authoritative at each step.

**Precision against recall.** Code property graphs return precise structural answers; semantic search deliberately over-fetches. Which one mattered depended on the question, so that choice moved into the planner rather than being made once at design time.

**Context size against reasoning depth.** Raw source preserves detail and exhausts the window. Summaries lose fidelity and let you go deeper. We optimized for depth over completeness, knowingly, which means the system could miss something a full-fidelity read would have caught.

**Fixed pipelines against adaptive workflows.** Rigid workflows assume repositories follow conventions. They don't. Iterative planning cost us determinism and bought resilience across languages and frameworks.

## Did it work

We already had a runtime-analysis engine backed by roughly a thousand OWASP API Top 10 test cases, so both approaches could be measured against the same benchmark. The traffic-based approach surfaced plenty of findings and enough false positives that triage became its own chore. Every finding needed a human to confirm before anyone would act on it.

The source-code system was built to avoid that: a finding had to be backed by a reconstructed execution path, not a pattern match against traffic shape. Against the same library it surfaced 70% more valid vulnerabilities, with no false positives on that benchmark.

I want to be careful about that second number, because "zero false positives" is a strong claim and the scope of it is narrow. That benchmark is a controlled test library where the ground truth is known. It is not customer traffic, and it does not mean the system produced no false positives in production. What it does mean is that requiring a reconstructed execution path as evidence eliminated the class of false positive the traffic-based system generated, which was the specific problem we set out to fix.

## How it ended

When we built this in 2024, foundation models struggled with repository-scale reasoning. Context windows were smaller, tool use was unreliable, and understanding code across files required real orchestration. A custom reasoning pipeline wasn't an optimization, it was the only way to do it.

That changed within a year. Models got much better at navigating repositories, reasoning across files, invoking tools and holding long context. Coding agents went from autocomplete to systems that natively did most of the exploration our pipeline was built to do.

The tradeoffs moved with them. Maintaining the orchestration layer stopped justifying its complexity, and we retired the feature from production. Not because it failed, because the constraint it was designed around stopped existing.
