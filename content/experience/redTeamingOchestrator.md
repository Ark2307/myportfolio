---
title: "I Built a Red Team Orchestrator for AI Agents. Here's What Actually Made It Hard."
date: "2026-06-10"
tags: ["security", "ai-infrastructure"]
excerpt: "How I built a multi-agent orchestration pipeline to automatically red-team any AI agent or MCP server — and what surprised me along the way."
---

# I Built a Red Team Orchestrator for AI Agents. Here's What Actually Made It Hard.

There's a version of this article that opens with something like: *"As AI adoption grows, security becomes increasingly important."* I'm not writing that one.

Instead, let me tell you about the engineering problem that led to one of the more interesting systems I've built — and specifically, what surprised me along the way.

---

## AI Security Doesn't Scale Like API Security

At Akto, we build API security tooling. Testing traditional APIs is something we've spent years doing well: send a crafted request, observe the response, determine whether a vulnerability exists. The workflow is deterministic, repeatable, and easy to automate at scale.

Then customers started deploying AI agents and MCP servers — and the same question started appearing: *can Akto test these too?*

It sounded like a natural extension. It wasn't.

Unlike an API vulnerability, an AI vulnerability rarely surfaces from a single request. It often emerges after a carefully constructed multi-turn conversation where every previous response shapes the next attack. You can't fuzz your way through that. There's no static payload that reliably breaks modern guardrails.

Testing an AI agent isn't about generating one clever prompt. It's about conducting a realistic conversation while continuously adapting your strategy based on how the target responds. That distinction changes everything about how you build the system.

---

## The Workflow We Wanted to Eliminate

Before this feature existed, testing an AI agent was a largely manual exercise. A security engineer would: understand how the target behaves, experiment with different jailbreak strategies, maintain context across previous turns, and then manually decide — based on their own experience — whether a given response actually represented a vulnerability.

The workflow was slow, hard to reproduce, and entirely dependent on the expertise of whoever was running it. Two engineers testing the same agent could easily reach different conclusions.

What we needed was a system that could do this automatically — and generically enough to work against *any* AI agent or authenticated MCP server, not just ones we'd pre-integrated with.

The goal: given any target, automatically conduct realistic attack conversations, validate whether a vulnerability actually exists, and produce remediation that customers could immediately act on.

Simple to state. Harder to build.

---

## Defining What "Success" Actually Meant

Before touching the architecture, I spent time on constraints. A successful system needed to:

- Work against arbitrary AI agents and authenticated MCP servers, without requiring custom integrations
- Preserve conversational context across turns so multi-step attack strategies could execute coherently
- Adapt to whatever request format the target happened to use
- Produce findings with high enough confidence that customers would actually trust them
- Generate remediation that was specific and actionable, not generic advice

These goals ended up driving almost every meaningful architectural decision that followed.

---

## Why One Big LLM Call Doesn't Work

The obvious design is also the wrong one: treat the entire workflow as a single prompt. Generate an attack, execute it, validate the response, produce remediation — all in one call.

In practice, every stage requires different reasoning. Attack generation needs creativity and context. Request construction needs structural understanding of an API you've never seen before. Validation needs evidence, not intuition. Remediation needs domain-specific security knowledge. Trying to compress all of that into one prompt produces something fragile that's mediocre at everything.

So the architecture naturally evolved into an orchestration pipeline: a dedicated Red Team Orchestrator that coordinates specialized agents, each owning exactly one reasoning task.

```
Testing Service
       │
       ▼
Red Team Orchestrator
       │
 ├── Context Manager
 ├── Analyse & Enhance Agent
 ├── Request Builder Agent
 ├── Target AI Agent / MCP Server
 ├── Response Parser
 ├── Validation Agent
 └── Remediation Agent
       │
       ▼
Dashboard
```

The orchestrator exposes a single API to the testing service. Inside, it handles everything.

This separation turned out to be more valuable than I expected. Validation logic could evolve independently. Attack generation could improve without touching remediation. When the Validation Agent was hallucinating during early testing, I could debug and fix it without changing anything else in the pipeline. That kind of isolation is worth the additional complexity.

---

## The Problems That Were Actually Interesting

Designing the architecture wasn't particularly difficult. Making it generic enough to work reliably across real customers' systems was.

### Attack Prompts Get Rejected Immediately

Our internal attack library contained instructions like:

> *"Attempt a prompt injection attack."*
> *"Use Base64 encoding to bypass guardrails."*
> *"Perform goal redirection."*

These are excellent instructions for a human security engineer. They're terrible prompts against modern AI systems. Most agents reject them immediately because the intent is explicit — you're essentially announcing the attack before it happens.

The fix became the **Analyse & Enhance Agent**, the first stage in the pipeline. It receives the attack objective, the target agent's description, and the full conversation history, and its job is to transform explicit attack templates into realistic conversational prompts that preserve the original objective while looking like something a real user might actually say. This meaningfully improved evaluation quality — the target agent gets something much closer to genuine user behaviour.

One escape hatch: prompts tagged as `<raw_prompt>` skip enhancement entirely. Sometimes you want to send a literal payload rather than a social-engineering approach.

### Supporting APIs You've Never Seen

Every AI agent exposes a different API. Some expect `{ "prompt": "..." }`. Others use nested message arrays. Some are GraphQL. Some stream SSE. Some are MCP servers with their own protocol entirely.

Hardcoding request formats doesn't scale. So I built the **Request Builder Agent**. During initialization, customers provide one sample authenticated request. The agent uses an LLM call to detect which field in that request carries user input — and caches that mapping per URL so we don't pay for the round-trip on every subsequent turn.

Once the injection point is known, the enhanced prompt gets written in: direct path-based surgery when possible, a full model-guided body rewrite as fallback. Session and conversation IDs extracted from previous responses are also injected here, maintaining multi-turn continuity with the target system. One abstraction, every API.

### Validation Was the Hardest Problem

The naive approach: ask another LLM "is this response vulnerable?" That produces poor results. Hallucinations everywhere, high false positive rates, and customers who quickly stop trusting the findings.

What actually worked was logical pre-filtering *before* the model gets involved. The Validation Agent evaluates responses against the executed attack strategy, expected behaviour, observed behaviour, conversation history, and — critically — **tool invocation data**.

That last one matters more than it sounds. An agent might return an entirely innocent-looking text response while simultaneously calling a tool that leaks sensitive data. If you're only validating what the agent *said*, you miss what it actually *did*. Surfacing tool call context to the validator was one of the higher-value changes I made.

The output includes a confidence score. Only high-confidence findings reach the customer dashboard. In a security product, fewer findings with genuine confidence consistently outperform exhaustive but noisy reports — every finding a customer investigates has a cost, and false positives erode trust fast.

Validation also only runs on the final turn of a conversation, when `isLastRequest` is true. Earlier turns accumulate context without triggering the full validation cost, which keeps per-turn latency acceptable for multi-shot attack sequences.

### Building Around Multi-Turn Conversations

Traditional API testing is request-response. AI security testing isn't. Many jailbreak techniques — Crescendo attacks, Tree Jailbreaking, Bad Likert Judge — specifically rely on building up context across turns before the actual attack lands. Treating each turn as independent makes these strategies impossible.

Conversation history became part of the architecture rather than a metadata detail. Each test execution runs under a unique Conversation ID. Subsequent prompts reuse previous interactions so the orchestrator can execute realistic multi-turn sequences. The last ten messages are prepended as history on each request — enough signal to produce contextually accurate attacks without flooding the context window with stale turns.

Later, this evolved into a reusable attack library where conversations could combine specific techniques (Base64, ROT13, Goal Redirection) with higher-level strategies (Crescendo, Tree Jailbreaking), and customers could build their own custom sequences on top.

---

## The Race Condition That Could Have Burned Money

One production issue had nothing to do with security vulnerabilities. It had everything to do with LLM spend.

The first version had no budget enforcement. A single test run could fan out dozens of parallel conversations, each making multiple LLM calls, with no ceiling on total spend. The only feedback was a line item on the Anthropic invoice at month end.

We introduced spend tracking using the Agent SDK's `total_cost_usd` field, with a configurable per-run budget that aborts with a 402 when exceeded. That solved the obvious problem.

The subtle problem was a race condition: two concurrent requests belonging to the same run could both read aggregate spend at $18.50, both pass the $20 limit check, and together push total spend to $37. The fix was serializing budget reads and execution per run ID using a promise-chain queue — effectively a per-run mutex. No request begins until the previous one's budget check and execution complete. The race disappeared.

Spend details now come back in every response — current cost, run total, configured limit — so the testing service has full visibility rather than waiting until billing.

---

## Tradeoffs I'd Make Again

Every startup project involves decisions made under time pressure. Some of mine:

**Sequential orchestration.** Parts of the pipeline could run in parallel. I kept it sequential because correctness and debuggability mattered more than latency during the initial rollout. A parallel pipeline that produces wrong results is harder to diagnose than a slow one that produces right results.

**Full-context enhancement.** The Analyse & Enhance Agent always receives the complete conversation history. This costs more tokens than semantic caching would, but produces more contextually accurate attack prompts. A semantic cache sits in the backlog — compute an embedding of the attack objective, compare against recent enhancements, return cached output if cosine similarity clears a threshold — but the token cost hasn't been painful enough to prioritize it yet.

**Per-conversation MCP initialization.** Every conversation gets its own MCP session. The startup cost is real. Shared sessions across customers introduce authentication leakage risk, which is a non-starter in a security product.

**Model-specific optimization.** The first version was intentionally built around Claude Sonnet. Smaller models produced noticeably weaker validation reasoning. Shipping a reliable solution for one model was the right call before abstracting across providers.

---

## What This Changed My Mind About

When I started, I thought AI red-teaming was fundamentally a prompting problem. Find the right attacks, send them, evaluate what comes back.

I don't think that anymore.

It's an orchestration problem. Generating realistic attacks, preserving conversational state, adapting to arbitrary APIs, normalizing heterogeneous responses, validating findings without hallucinating, producing actionable remediation — these require genuinely different reasoning capabilities. Bundling them into one LLM call makes a system that's mediocre at everything.

The interesting engineering challenge wasn't building better prompts. It was designing how multiple specialized agents collaborate to simulate the reasoning process of an experienced security engineer running a real assessment.

That's what made this project worth writing about. And it's exactly where I'd keep investing.

---

*Building AI agent security tooling or running into weird edge cases with MCP servers? I'd genuinely like to hear about it.*