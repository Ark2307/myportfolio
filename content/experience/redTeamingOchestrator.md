---
title: "I Built a Red Team Orchestrator for AI Agents. Here's What Made It Hard."
date: "2026-06-10"
tags: ["security", "ai-infrastructure"]
excerpt: "AI red-teaming looks like a prompting problem. It isn't. The hard parts were making attacks survive first contact with a guardrail, validating findings against tool calls rather than text, and a budget race condition that let two requests spend $37 against a $20 limit."
---

# I Built a Red Team Orchestrator for AI Agents. Here's What Made It Hard.

There's a version of this article that opens with something like: *"As AI adoption grows, security becomes increasingly important."* I'm not writing that one.

I started this thinking AI red-teaming was a prompting problem. It's an orchestration problem, and the specific things that changed my mind are below.

---

## AI Security Doesn't Scale Like API Security

At Akto we build API security tooling, and testing traditional APIs is something we've spent years doing well: send a crafted request, observe the response, decide whether a vulnerability exists. Deterministic, repeatable, easy to automate.

Then customers started deploying AI agents and MCP servers, and the question arrived: can Akto test these too?

Unlike an API vulnerability, an AI vulnerability rarely surfaces from a single request. It emerges after a constructed multi-turn conversation where each response shapes the next attack. You can't fuzz through that, and there's no static payload that reliably breaks a modern guardrail. Testing an AI agent means conducting a realistic conversation and adapting as the target responds, and that difference determines the entire shape of the system.

Before this existed, that was a manual job: a security engineer understanding the target, trying jailbreak strategies, holding context across turns, and judging from experience whether a response was a vulnerability. Slow, hard to reproduce, and dependent on who was running it. Two engineers testing the same agent could reach different conclusions, which in a security product is the actual problem, because a finding is worth exactly what the customer's trust in it is worth.

---

## Why One Big LLM Call Doesn't Work

The obvious design is also the wrong one: treat the entire workflow as a single prompt. Generate an attack, execute it, validate the response, produce remediation, all in one call.

Every stage needs different reasoning. Attack generation needs creativity and context. Request construction needs structural understanding of an API you've never seen. Validation needs evidence rather than intuition. Remediation needs domain knowledge. Compress all of that into one prompt and you get something fragile that's mediocre at each of them.

So the architecture became an orchestration pipeline: a Red Team Orchestrator coordinating specialized agents, each owning exactly one reasoning task.

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

The orchestrator exposes one API to the testing service and handles everything inside.

That separation was worth more than I expected. When the Validation Agent was hallucinating during early testing, I could debug and fix it without touching attack generation or remediation, which is the only reason that bug took days instead of weeks.

---

## The Problems That Were Interesting

Designing the architecture wasn't hard. Making it generic enough to work across real customers' systems was.

### Attack Prompts Get Rejected Immediately

Our internal attack library contained instructions like:

> *"Attempt a prompt injection attack."*
> *"Use Base64 encoding to bypass guardrails."*
> *"Perform goal redirection."*

These are excellent instructions for a human security engineer. They're terrible prompts against modern AI systems. Most agents reject them on sight, because the intent is explicit. You're announcing the attack before you make it.

The fix became the **Analyse & Enhance Agent**, the first stage in the pipeline. It receives the attack objective, the target agent's description, and the full conversation history, and transforms explicit attack templates into prompts that preserve the objective while reading like something a real user would say.

The difference this makes isn't a quality score, it's a precondition. An announced attack gets refused on turn one, and a refusal on turn one means every multi-turn strategy below is unreachable, because there is no conversation to build context in. Enhancement isn't there to make attacks better. It's there to make them survive long enough to be attacks.

One escape hatch: prompts tagged as `<raw_prompt>` skip enhancement entirely. Sometimes you want to send a literal payload rather than a social-engineering approach.

### Supporting APIs You've Never Seen

Every AI agent exposes a different API. Some expect `{ "prompt": "..." }`, others nested message arrays, some GraphQL, some SSE streams, some the MCP protocol.

Hardcoding formats doesn't scale, so the **Request Builder Agent** takes one sample authenticated request at initialization and uses an LLM call to detect which field carries user input, caching that mapping per URL so we don't pay the round-trip every turn. Once the injection point is known the enhanced prompt is written in: path-based surgery where possible, a model-guided body rewrite as fallback. Session and conversation IDs from previous responses get injected here too.

### Validation Was the Hardest Problem

The naive approach: ask another LLM "is this response vulnerable?" That produces poor results. Hallucinations everywhere, high false positive rates, and customers who quickly stop trusting the findings.

What worked was logical pre-filtering *before* the model gets involved. The Validation Agent evaluates responses against the executed attack strategy, expected behaviour, observed behaviour, conversation history, and, critically, **tool invocation data**.

That last one matters more than it sounds. An agent can return a completely innocent-looking text response while calling a tool that leaks sensitive data. Validate only what the agent *said* and you miss what it *did*, which means the worst outcomes are the ones you're structurally blind to. Surfacing tool call context to the validator was the highest-value change I made to this pipeline.

The output includes a confidence score, and only findings above the threshold reach the customer dashboard. That's a deliberate recall sacrifice. We know we drop real vulnerabilities that scored below the line, and we accept it, because every finding a customer investigates costs them time and the first false positive costs more trust than the tenth true positive earns.

Validation only runs on the final turn, when `isLastRequest` is true. Earlier turns accumulate context without paying full validation cost, which keeps per-turn latency workable for multi-shot sequences.

### Building Around Multi-Turn Conversations

Several jailbreak techniques (Crescendo, Tree Jailbreaking, Bad Likert Judge) rely specifically on building context across turns before the attack lands. Treat each turn as independent and those strategies become impossible to express.

So conversation history is part of the architecture rather than a metadata field. Each execution runs under a unique Conversation ID, and the last ten messages are prepended as history on each request: enough signal for contextually accurate attacks without filling the window with stale turns. That grew into a reusable library where conversations combine techniques (Base64, ROT13, Goal Redirection) with higher-level strategies, and customers build their own sequences on top.

---

## The Race Condition That Could Have Burned Money

One production issue had nothing to do with vulnerabilities and everything to do with LLM spend.

The first version had no budget enforcement. A single run could fan out dozens of parallel conversations, each making multiple LLM calls, with no ceiling. The only feedback was a line item on the invoice at month end. So we added spend tracking on the Agent SDK's `total_cost_usd` field, with a configurable per-run budget that aborts with a 402 when exceeded.

The subtle problem was a race condition: two concurrent requests belonging to the same run could both read aggregate spend at $18.50, both pass the $20 limit check, and together push total spend to $37. The fix was serializing budget reads and execution per run ID with a promise-chain queue, effectively a per-run mutex. No request begins until the previous one's budget check and execution complete.

That fix costs concurrency inside a run, and I took it without much hesitation. A budget check that isn't serialized isn't a budget check, it's a suggestion, and the failure mode is money.

Spend details now come back in every response (current cost, run total, configured limit) so the testing service has visibility rather than waiting for billing.

---

## Tradeoffs I'd Make Again

Every startup project involves decisions made under time pressure. Some of mine:

**Sequential orchestration.** Parts of the pipeline could run in parallel. I kept it sequential because correctness and debuggability mattered more than latency during the initial rollout. A parallel pipeline that produces wrong results is harder to diagnose than a slow one that produces right results.

**Full-context enhancement.** The Analyse & Enhance Agent always receives the complete conversation history. This costs more tokens than semantic caching would, and produces more contextually accurate attack prompts. A semantic cache sits in the backlog: compute an embedding of the attack objective, compare against recent enhancements, return cached output if cosine similarity clears a threshold. The token cost hasn't been painful enough to prioritize it yet.

**Per-conversation MCP initialization.** Every conversation gets its own MCP session. The startup cost is real. Shared sessions across customers introduce authentication leakage risk, which is a non-starter in a security product.

**Model-specific optimization.** The first version was built around Claude Sonnet on purpose. Smaller models produced weaker validation reasoning, specifically on the step where the validator has to weigh tool-call evidence against response text, which is the step the whole product's credibility rests on. Shipping reliably for one model came before abstracting across providers.

---

## What This Changed My Mind About

When I started, I thought AI red-teaming was a prompting problem. Find the right attacks, send them, evaluate what comes back.

I don't think that anymore. The prompts turned out to be the least durable part of the system. Guardrails change, so any specific phrasing has a shelf life, and the attack library needed to be replaceable rather than good.

What's held up is the shape underneath it: a stage that makes an attack survive first contact, a builder that adapts to an API it has never seen, a validator that looks at tool calls rather than text, and a mutex around anything that spends money. None of those are prompting concerns, and all of them are still there.

The specific thing I'd tell someone starting this: pick your validation evidence before you pick your attacks. Everything upstream is replaceable, and the validator is what makes a finding worth sending to a customer.

---

*Building AI agent security tooling or running into weird edge cases with MCP servers? I'd like to hear about it.*