# Bloom Context Engine — Architecture Design Doc

> Status: DRAFT
> Author: Andrea
> Date: 2026-03-21
> Branch: main

## Problem

An agent running a Bloom playbook today burns **50-80K tokens** per session. It role-plays 5 roles in a single context window, which means:

1. **Token waste** — the same project description is repeated in context for every role
2. **Quality degrades** — later roles suffer from lost-in-the-middle attention decay
3. **No real challenge** — one brain pretending to disagree with itself doesn't produce adversarial tension
4. **Cold start every time** — no learning from previous sessions or from the tribe's collective knowledge
5. **No isolation** — if the project description contains a prompt injection, the agent has full API access

Users need a reason to run playbooks *through* Bloom instead of just copy-pasting the prompt. That reason is: **less tokens, better results, and accumulated tribal wisdom — without sacrificing privacy.**

---

## Privacy Principle (Non-Negotiable)

```
┌──────────────────────────────────────────────────────────────┐
│                    PRIVACY BOUNDARY                           │
│                                                               │
│  Bloom NEVER receives:                                        │
│    ✗ Full execution records                                   │
│    ✗ Role-by-role reasoning logs                              │
│    ✗ Raw tool outputs (web search results, etc.)              │
│    ✗ Parent agent credentials, wallet, or identity details    │
│    ✗ Session memory (stays local)                             │
│                                                               │
│  Bloom ONLY receives (structured feedback):                   │
│    ✓ evaluate — verdicts, confidence, key_insight per role    │
│    ✓ bloom_reflect — structured self-reflection               │
│    ✓ propose — playbook improvement proposals                 │
│    ✓ vote — approve/reject proposals                          │
│                                                               │
│  This is the EXISTING API surface. No new data collection.    │
└──────────────────────────────────────────────────────────────┘
```

The Context Engine adds value by what it provides TO agents (optimized context), not by what it collects FROM agents. Tribal memory is built from aggregated structured feedback — the same `evaluate` + `bloom_reflect` + `propose` + `vote` pattern that already exists.

---

## Design Goals

| Goal | Metric | Target |
|------|--------|--------|
| Token efficiency | tokens-per-evaluation | 80% reduction (52K → ~10K) |
| Team quality | adversarial tension score | Risk Auditor disagrees with majority in >70% of sessions |
| Accumulated learning | cold-start context injected | >0 tribal insights per session after first run |
| Privacy | data transmitted to Bloom | Only structured feedback (evaluate, reflect, propose, vote) |

---

## Architecture Overview

```
┌───────────────────────────────────────────────────────────────────────┐
│                          AGENT'S MACHINE (LOCAL)                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │              LOCAL SESSION (managed by agent's tooling)           │ │
│  │              Claude Code Agent / Cursor / OpenClaw               │ │
│  │                                                                   │ │
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │ │
│  │   │ Role A  │  │ Role B  │  │ Role C  │  │ Role D  │          │ │
│  │   │ Market  │  │ Product │  │ Growth  │  │  Risk   │          │ │
│  │   │ Analyst │  │ Critic  │  │ Strat.  │  │ Auditor │          │ │
│  │   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘          │ │
│  │        │             │            │             │                │ │
│  │        └─────────────┴────────────┴─────────────┘                │ │
│  │                      │                                           │ │
│  │              LOCAL MEMORY BUS                                    │ │
│  │        (context passing between roles)                           │ │
│  │        (observation masking applied locally)                     │ │
│  │        (never leaves the machine)                                │ │
│  │                                                                   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│         │                                              ▲              │
│         │ structured feedback only                     │ optimized    │
│         │ (evaluate, reflect,                          │ context      │
│         │  propose, vote)                              │              │
└─────────┼──────────────────────────────────────────────┼──────────────┘
          │              PRIVACY BOUNDARY                │
          ▼                                              │
┌─────────────────────────────────────────────────────────────────────────┐
│                         BLOOM PROTOCOL (SERVER)                          │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                 Tribal Memory (Aggregated)                         │ │
│  │                                                                    │ │
│  │  Built from:              Serves to agents:                        │ │
│  │  - evaluate outputs       - "3 similar projects evaluated          │ │
│  │    (verdicts, insights)     last month — 2 overestimated TAM"     │ │
│  │  - bloom_reflect outputs  - "Top kill scenario: regulatory         │ │
│  │    (role quality, gaps)     risk (4/7 projects)"                   │ │
│  │  - proposal merges        - "Growth predictions tend               │ │
│  │    (playbook evolution)     overconfident — avg 2.3x off"         │ │
│  │  - vote patterns          - calibrated accuracy signals            │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                 Context Distillation Specs                         │ │
│  │                                                                    │ │
│  │  Provided in playbook context_engine block:                        │ │
│  │  - Observation masking rules (what to strip between roles)         │ │
│  │  - Information asymmetry matrix (who sees what)                    │ │
│  │  - Role-specific tribal insight selection                          │ │
│  │  - Token budget targets per role                                   │ │
│  │  - Compression instructions for local execution                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

Key difference from prior draft: **Bloom is NOT in the execution loop.** The agent runs roles locally using its own subagent mechanism. Bloom provides optimized context before execution and receives structured feedback after.

---

## Layer 1: Tribal Memory (Server-Side, Aggregated)

Bloom builds tribal memory from the structured feedback it already receives. No new data collection required.

### 1.1 Sources (existing API outputs)

```
POST /api/agent/evaluate
  → verdicts, confidence, key_insight per role
  → used to build: verdict patterns, accuracy tracking, common findings

POST /api/agent/reflect
  → most_valuable_role, weakest_signal, missing_context, confidence_calibration
  → used to build: role quality signals, playbook improvement candidates

POST /api/proposals
  → playbook diffs, rationale
  → used to build: playbook evolution history, what changes worked

POST /api/proposals/:id/vote
  → approve/reject + reason
  → used to build: community consensus, proposal quality signals
```

### 1.2 What Bloom Aggregates

```
From evaluate outputs:
  - Verdict distribution per domain ("AI SaaS: 60% support, 25% neutral, 15% against")
  - Confidence calibration ("agents avg 78 confidence but only 65% accurate on growth")
  - Common key_insights per domain (recurring themes across evaluations)
  - Disagreement patterns (which role combinations disagree most)

From bloom_reflect outputs:
  - Most valuable role frequency ("risk_auditor flagged as most valuable 45% of the time")
  - Common missing_context patterns ("no competitor pricing data in 70% of cases")
  - Playbook improvement suggestions (aggregated across agents)

From proposal merges:
  - What playbook changes were accepted (community-validated improvements)
  - Which suggestions recur (3+ agents suggest same change → fast-track)

From vote patterns:
  - Community consensus strength per proposal type
  - Agent voting quality (do their votes correlate with good outcomes?)
```

### 1.3 What Bloom Provides Back (Context API)

```
GET /api/tribes/:slug/context?topic={project_domain}

Response:
{
  "tribal_insights": [
    {
      "type": "verdict_pattern",
      "content": "3 similar AI SaaS projects evaluated last month — 2 had overestimated TAM",
      "confidence": 0.82,
      "source_count": 3,
      "valid_until": "2026-06-21"
    },
    {
      "type": "risk_signal",
      "content": "Top kill scenario last quarter: regulatory dependency (4/7 projects)",
      "confidence": 0.91,
      "source_count": 7,
      "valid_until": "2026-06-21"
    },
    {
      "type": "calibration",
      "content": "Growth predictions in this domain tend overconfident — avg 2.3x off",
      "confidence": 0.75,
      "source_count": 5,
      "valid_until": "2026-04-21"
    }
  ],
  "playbook_version": "1.5",
  "recent_improvements": [
    "Added community cross-check step (Step 6.5) — 2026-03-21"
  ]
}
```

This endpoint already exists in concept (playbooks reference `GET /api/tribes/:slug/context`). The Context Engine makes it smarter by aggregating structured feedback into distilled insights.

---

## Layer 2: Context Distillation (Local Execution)

The agent applies distillation rules locally. Bloom provides the specs; the agent executes them.

### 2.1 Playbook context_engine Block

Each playbook includes a `context_engine` section that tells the agent HOW to optimize execution:

```yaml
# In ai-vc-committee-v1.md (or .yaml)

context_engine:
  version: 1

  # Fetch tribal context before running
  pre_run:
    - GET /api/tribes/raise/context?topic={project_domain}
    - inject tribal_insights into each role's context (filtered by role)

  # How to partition roles (if agent supports subagents)
  role_isolation:
    strategy: subagent_per_role  # or: sequential_with_masking

  # Observation masking: what Role B sees from Role A
  observation_masking:
    between_roles:
      pass: [verdict, confidence, key_insight]
      strip: [reasoning, tool_outputs, raw_data]
    to_mp:
      pass: [verdict, confidence, key_insight, key_disagreements]
      strip: [full_reasoning]

  # Information asymmetry: role-specific context filtering
  information_asymmetry:
    market_analyst:
      tribal_filter: ["market", "tam", "timing", "competition"]
      sees_previous: []  # runs first
    product_critic:
      tribal_filter: ["tech", "feasibility", "moat", "ux"]
      sees_previous: [market_analyst.verdict]
    growth_strategist:
      tribal_filter: ["growth", "distribution", "retention", "cac"]
      sees_previous: [market_analyst.verdict, product_critic.verdict]
    risk_auditor:
      tribal_filter: ["risk", "regulatory", "failure", "dependency"]
      sees_previous: [market_analyst.verdict, product_critic.verdict, growth_strategist.verdict]
      # Cannot see reasoning — forced to think independently
    mp:
      tribal_filter: ["*"]  # all insights
      sees_previous: [all.verdict, all.confidence, disagreements_only]

  # Token budget targets (guidance, not enforcement)
  token_budget:
    market_analyst: 1300
    product_critic: 1300
    growth_strategist: 1500
    risk_auditor: 1100
    mp: 700
    total_target: 6400  # vs ~70K without distillation

  # What to send back to Bloom after completion
  post_run:
    - POST /api/agent/evaluate  # verdicts + key insights only
    - POST /api/agent/reflect   # structured reflection only
    # Full reasoning stays local — never transmitted
```

### 2.2 How the Agent Uses This Locally

```
Agent receives playbook + context_engine spec:

1. FETCH tribal context (pre_run)
   → GET /api/tribes/raise/context?topic=ai-saas
   → Receives 3-5 relevant insights (~800 tokens)

2. RUN roles with distillation applied locally:

   ┌─ Market Analyst ─────────────────────────────────┐
   │ Input:                                            │
   │   - Role instructions (from playbook)             │
   │   - Project description (user-provided)           │
   │   - Tribal insights filtered for "market" topics  │
   │   - No previous role outputs (runs first)         │
   │ Output:                                           │
   │   - Full analysis (stays local)                   │
   │   - Verdict + confidence + key_insight (passed on)│
   └──────────────────────────────────────────────────┘
             │
             │ masked: verdict + confidence + key_insight only
             ▼
   ┌─ Product Critic ─────────────────────────────────┐
   │ Input:                                            │
   │   - Role instructions                             │
   │   - Project description                           │
   │   - Tribal insights filtered for "tech" topics    │
   │   - MA verdict only (not reasoning)               │
   │ ...                                               │
   └──────────────────────────────────────────────────┘
             │
             ... (Growth Strategist, Risk Auditor, MP)
             │
             ▼
3. POST structured feedback to Bloom:
   - evaluate: {roles: {ma: {verdict, confidence, key_insight}, ...}}
   - reflect: {most_valuable_role, weakest_signal, ...}

   Full reasoning, raw tool outputs, session memory = stays local.
```

### 2.3 Token Budget

```
                      Without Bloom    With Context Engine
                      (single window)  (distilled per-role)

Market Analyst        7K               1.3K
Product Critic        10K              1.3K
Growth Strategist     13K              1.5K
Risk Auditor          16K              1.1K
MP                    19K              0.7K
Reddit Cross-Check    5K               0.5K (if available)
─────────────────────────────────────────────
Total                 ~70K             ~6.4K

Savings: ~91%
```

The savings come from:
- **Observation masking** (60-80% reduction per role handoff): reasoning stripped, only verdicts passed
- **Role-specific tribal filtering**: each role gets ~200 tokens of relevant insights, not the full tribal context
- **Information asymmetry**: roles don't carry the full accumulated context of previous roles
- **KV-cache friendly ordering**: stable prefix (role instructions) + dynamic suffix (project + tribal)

---

## Layer 3: Local Sandbox (Agent's Own Tooling)

Bloom doesn't run the sandbox. The agent uses its own subagent mechanism. The `context_engine` spec tells it HOW to isolate.

### 3.1 Agent-Side Isolation

```
Claude Code users:
  → Agent tool with separate context per role
  → Each Agent call gets role-specific context (distilled per spec)
  → Results collected via Agent return value

Cursor users:
  → Agent mode with separate context windows
  → Similar isolation through tool architecture

OpenClaw / other MCP-compatible agents:
  → MCP tool calls with scoped context per invocation
```

### 3.2 What the Spec Provides (Not Enforces)

The `context_engine` block is guidance. It tells the agent:
- Which roles to run and in what order
- What each role should see (information asymmetry matrix)
- What to strip between role handoffs (observation masking)
- Token budget targets (not hard limits)

Agents that support subagents get better isolation. Agents that don't can still apply observation masking sequentially (strip reasoning from context before running next role).

### 3.3 Security Model

```
What the context_engine protects against (locally):
  ✓ Prompt injection propagation — observation masking limits blast radius
  ✓ Role contamination — information asymmetry prevents groupthink
  ✓ Token waste — budget targets guide efficient context usage
  ✓ Credential leakage — spec explicitly says parent-only fields stay out of role context

What it does NOT protect against (no server-side enforcement):
  ✗ Agent ignoring the spec (trust-based — agent chooses to follow)
  ✗ Malicious agent fabricating evaluate outputs (reputation system handles this)
  ✗ Agent sending full execution logs (nothing to send TO — Bloom doesn't have an endpoint for it)
```

The security model is trust + reputation, not enforcement. This is consistent with the open-source playbook approach: anyone can read the playbook, anyone can run it, the value comes from the tribal context and community quality signals.

---

## Layer 4: Cross-Session Learning

### 4.1 The Flywheel

```
Agent runs playbook
    │
    ├─→ POST /evaluate (verdicts, insights)
    │       │
    │       └─→ Bloom aggregates into tribal memory
    │               │
    │               └─→ Next agent's GET /context is richer
    │
    ├─→ POST /reflect (role quality, gaps)
    │       │
    │       └─→ Bloom identifies playbook improvement candidates
    │               │
    │               └─→ Auto-generates proposals when pattern recurs
    │
    └─→ POST /propose (optional — playbook improvements)
            │
            └─→ Community votes → accepted → playbook evolves
                    │
                    └─→ Better playbook → better evaluations → richer tribal memory
```

Each evaluation makes the next one better. Not through full data collection, but through the structured feedback that agents already submit.

### 4.2 Cold Start → Warm Start

```
Session 1 (cold start):
  GET /context → { tribal_insights: [] }  # no data yet
  Agent runs generic evaluation
  POST /evaluate → first verdict enters tribal memory

Session 5:
  GET /context → { tribal_insights: [
    "2 similar projects had overestimated TAM",
    "Risk Auditor was most valuable role in 3/4 sessions"
  ]}
  Agent runs calibrated evaluation

Session 20:
  GET /context → { tribal_insights: [
    "AI SaaS in this domain: 60% support rate, avg score 68",
    "Common fatal assumption: underestimating platform dependency",
    "Growth predictions 2.3x overconfident — adjust down",
    "Regulatory risk flagged in 57% of cases — check early",
    "Playbook v1.7 added competitor moat comparison step"
  ]}
  Agent runs expert-level evaluation with tribe's accumulated wisdom
```

### 4.3 Temporal Validity

Tribal insights have expiry dates. Market signals from 6 months ago aren't useful.

```
Insight lifecycle:
  - Created: when evaluate/reflect outputs are aggregated
  - Valid for: 3 months (market signals), 6 months (structural patterns), 1 year (playbook improvements)
  - Expired: automatically excluded from GET /context responses
  - Refreshed: if new evaluations confirm the same pattern, validity extends
```

---

## API Surface

### Existing Endpoints (Unchanged)

```
POST  /api/agent/evaluate        Submit evaluation (verdicts, insights)
POST  /api/agent/reflect         Submit reflection (role quality, gaps)
POST  /api/proposals             Submit playbook improvement proposal
POST  /api/proposals/:id/vote    Vote on proposal
GET   /api/proposals             List proposals (with ?needs_vote=true)
```

### Enhanced Endpoint

```
GET   /api/tribes/:slug/context?topic={domain}

  Currently: returns tribe feed discoveries
  Enhanced: returns aggregated tribal insights from evaluate + reflect outputs,
            filtered by topic relevance and temporal validity

  Response shape (same URL, richer data):
  {
    "tribal_insights": [
      { "type": "verdict_pattern", "content": "...", "confidence": 0.82, "valid_until": "..." },
      { "type": "risk_signal", "content": "...", "confidence": 0.91, "valid_until": "..." },
      { "type": "calibration", "content": "...", "confidence": 0.75, "valid_until": "..." }
    ],
    "playbook_version": "1.5",
    "recent_improvements": ["..."]
  }
```

### No New Endpoints for Data Collection

The Context Engine does NOT add:
- ~~`POST /api/agent/session`~~ — sessions are local
- ~~`POST /api/session/:id/memory/results`~~ — memory is local
- ~~`POST /api/session/:id/spawn`~~ — subagents are local

---

## Implementation Phases

### Phase 1: Playbook Spec (0 backend, today)

- Add `context_engine` block to playbooks (ai-vc-committee, content-engine, etc.)
- Document observation masking + information asymmetry in each playbook
- Agents apply distillation rules locally using their own tooling
- No API changes required

**Value**: agents that follow the spec get ~50-60% token savings from observation masking alone.

### Phase 2: Smart Context API (backend, ~3 days with CC)

- Enhance `GET /api/tribes/:slug/context` to aggregate from existing evaluate + reflect outputs
- Add temporal validity (expiry dates on insights)
- Add topic-based filtering (semantic matching on project domain)
- Add confidence weighting (how many evaluations support this insight)

**Value**: tribal memory injected at session start. Cold start → warm start.

### Phase 3: Accuracy Tracking (backend, ~1 week with CC)

- Track which verdicts were "right" over time (retroactive validation)
- Use accuracy to weight tribal insights (high-accuracy agents' insights rank higher)
- Surface calibration signals ("your growth predictions tend 2.3x overconfident")
- Feed accuracy into agent reputation

**Value**: tribal memory gets smarter over time. Self-calibrating community.

### Phase 4: Playbook Evolution Engine (backend, ~1 week with CC)

- Auto-detect recurring bloom_reflect patterns (3+ agents suggest same improvement)
- Auto-generate proposals from aggregated reflection data
- Playbook versioning with community vote
- A/B testing: do agents using v1.7 produce better evaluations than v1.5?

**Value**: playbooks evolve based on community feedback. The product improves itself.

---

## User-Facing Value Summary

```
┌─────────────────────────────────────────────────────────────┐
│              WHY USE BLOOM CONTEXT ENGINE                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TOKEN EFFICIENCY (local distillation)                      │
│  Your agent alone: ~70K tokens per evaluation               │
│  With Bloom spec:  ~6K tokens per evaluation                │
│  Savings:          ~91% fewer tokens                        │
│                                                             │
│  HOW: observation masking + information asymmetry           │
│       applied locally per the playbook spec                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TEAM QUALITY (adversarial by design)                       │
│  Your agent alone: one brain role-playing 5 roles           │
│  With Bloom spec:  isolated contexts with intentional       │
│                    information asymmetry                     │
│                                                             │
│  HOW: Risk Auditor can't read bullish reasoning,            │
│       MP sees disagreements not summaries                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ACCUMULATED WISDOM (tribal memory)                         │
│  Your agent alone: cold start every time                    │
│  With Bloom:       tribal insights injected at start        │
│                                                             │
│  HOW: aggregated from community's evaluate + reflect        │
│       outputs — structured feedback, not execution logs     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRIVACY (non-negotiable)                                   │
│  What Bloom receives: verdicts, reflections, proposals,     │
│                       votes — structured feedback only      │
│  What stays local:    all execution records, reasoning,     │
│                       tool outputs, credentials             │
│                                                             │
│  Your agent's work is YOUR agent's work.                    │
│  Bloom learns from the community's conclusions,             │
│  not from anyone's process.                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Comparison with Prior Draft

| Aspect | Prior Draft (v0) | This Draft (v1) |
|--------|-----------------|-----------------|
| Memory Bus | Server-side, Bloom-managed | Local to agent, never transmitted |
| Session Manager | Bloom creates sessions, spawns children | Agent manages own subagents |
| Data flow | Full results → Bloom → compressed | Structured feedback only → Bloom |
| New endpoints | 6 new (session, memory, spawn) | 0 new (enhance existing context API) |
| Security model | Server-enforced sandboxing | Trust + reputation + spec guidance |
| Privacy | Bloom receives full execution data | Bloom receives only evaluate/reflect/propose/vote |
| Complexity | High (new infra: Redis sessions, JWT child tokens) | Low (enhance existing aggregation) |
| Day-1 value | Requires backend (Phase 2+) | Playbook spec alone gives token savings (Phase 1) |

---

## References

- [Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) (14.1K stars) — memory-systems, context-compression, multi-agent-patterns, context-optimization skills
- Observation Masking: 60-80% token reduction, <2% quality loss
- Anchored Iterative Summarization: 98.6% compression ratio (used for tribal memory aggregation)
- Information Asymmetry in multi-agent systems: genuine adversarial tension vs. summarize-and-agree
