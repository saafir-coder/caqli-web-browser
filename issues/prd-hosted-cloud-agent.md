# PRD — Hosted cloud agent (phone remote control, BYO providers, hosted pool)

**Product:** Caqli AI Web Browser (`products/caqli-web-browser`)  
**Domain glossary:** `CONTEXT.md` (UI/product terms); product-line terms in meta repo `CONTEXT.md` and `docs/adr/0001-hosted-agent-architecture.md`  
**Related PRD:** `issues/prd.md` (hosted auth, onboarding shell, app surfaces)  
**Date:** 2026-05-28

---

## Problem Statement

Many developers—especially on **phones**—want a capable **coding agent** without keeping a **laptop on** or owning a machine that runs Codex remote control, Claude Code, or Cursor locally. They already pay for **Cursor**, **Codex**, or **Claude Code** subscriptions and expect usage to bill to those accounts, while Caqli should host the **sandbox compute** (files, tools, agent processes) in the cloud.

Today the web-browser codebase can broker **Agent** sessions on a **T3 server** the user runs (or pairs to), but production **Users** need Caqli-operated **Hosted pool** capacity, **BYO provider credentials** stored safely (never on the phone), and a clear path from **Sign-in** → **Project** → **Connect provider** → first real **Agent run** visible in **Chat** and **Code**—matching the “cloud agent like Cursor, phone as remote control” model from ADR-0001.

---

## Solution

Extend the hosted product in `caqli-web-browser` with:

1. **Control plane** persistence (Auth + Postgres, e.g. Supabase) for **Users**, **Projects**, **Threads**, encrypted **Provider credentials**, **Usage limit** state, **session resume**, and access flags (invite / waitlist).
2. **Hosted pool** of shared **Execution environments** (T3 servers) where each **Project** has an isolated **Hosted workspace** (files persist; **Agent runs** are ephemeral).
3. **Connect provider** onboarding after first **Project** creation, listing **Cursor**, **Codex**, and **Claude Code** with honest **Coming soon** until wired; **Codex** is the dogfood blocker.
4. **BYO proxy**: server-side decrypt of credentials only when starting outbound provider calls; **Client** never receives secrets after connect.
5. **Dogfood** gate: invite-only, **happy path** proof (one **Codex** message, file change visible in **Code**); **public** gate: full `issues/prd.md` bar plus waitlist-approved cohorts.

Mobile **Client** remains responsive web (PWA later); single deployable product (no separate onboarding app URL).

---

## User Stories

1. As a **developer without a laptop**, I want to run a coding **Agent** from my phone browser, so that I can ship work from Android or iPhone only.
2. As a **User**, I want Caqli to run the agent in the **cloud**, so that I do not need my home computer powered on.
3. As a **User**, I want my **Project** files to persist between sessions, so that the agent’s work is not lost when an **Agent run** ends.
4. As a **User**, I want **Agent runs** to spin up on demand, so that I am not paying for an always-on VM when idle.
5. As a **User** on a paid tier later, I want an optional **Warm environment**, so that my next **Agent run** starts faster (out of scope for dogfood).
6. As a **User**, I want to connect my existing **Codex** subscription, so that model usage bills to my OpenAI account.
7. As a **User**, I want to connect **Claude Code** when available, so that I can use my Anthropic subscription the same way.
8. As a **User**, I want to see **Cursor** in the provider list, so that I know Caqli supports the tool I already use—even if it is not wired yet.
9. As a **User**, I want providers that are not ready to show **Coming soon**, so that I am not misled by a broken connect button.
10. As a **User**, I want to complete **Connect provider** after naming my first **Project**, so that I understand billing before **Chat**.
11. As a **User**, I want copy on **Connect provider** that model usage bills to my provider account, so that I am not surprised by charges.
12. As a **User**, I want to land in **Chat** after connecting (or skipping only via explicit later path), so that the product feels immediate.
13. As a **User**, if I reach **Chat** without credentials, I want the first **Send** to prompt connect, so that I am not stuck silently.
14. As a **User**, I want my provider secrets stored only on Caqli servers, so that my phone browser never holds API keys.
15. As a **security-conscious User**, I want credentials encrypted at rest, so that a database leak does not expose plaintext keys.
16. As a **User**, I want Caqli to enforce a daily **Usage limit** on **hosted compute**, so that free tier abuse is bounded.
17. As a **User**, I want to understand that **Usage limit** is about Caqli sandbox time, not my Anthropic/OpenAI bill, so that limits feel fair.
18. As a **User** who hit the cap, I want to read **Chat** and browse **Code** still, so that I am soft-blocked not locked out.
19. As a **User** who hit the cap, I want **new agent turns** blocked with clear messaging, so that I know why **Send** failed.
20. As a **User**, I want a **Default agent provider** in settings, so that new **Threads** start with my usual backend.
21. As a **User**, I want to pick **Thread provider** when creating a **Thread**, so that I can use Codex on one task and Claude Code on another.
22. As a **User**, I want **Thread provider** fixed for the life of that **Thread**, so that conversation context stays coherent.
23. As a **User**, I want only one active **Agent run** per **Project** during early dogfood, so that two agents do not corrupt the same files.
24. As a **User** after public launch, I want a small parallel cap per **Project**, so that limited multitasking is possible without chaos.
25. As a **first-time User**, I want an empty **Hosted workspace** when I create a **Project**, so that I can start greenfield from my phone.
26. As a **User**, I want optional **Import from GitHub** after create, so that I can clone an existing repo when I need it.
27. As a **User**, I want **Import from GitHub** to be optional before my first message, so that I am not blocked on GitHub OAuth.
28. As a **User**, I want **Chat** and **Code** to show the same **Hosted workspace**, so that file changes match what the agent did.
29. As a **User** on **phone**, I want the hosted app to work in mobile Safari/Chrome, so that I do not need an App Store install for MVP.
30. As a **User**, I want one hosted URL and one login session, so that onboarding and workspace are not split across apps.
31. As a **dogfood User**, I want access only if I am invited, so that the team controls blast radius.
32. As an **operator**, I want an allowlist (email, code, or flag), so that I can add testers safely.
33. As a **waitlist User**, I want to submit email on the **Landing page**, so that I can request access before approval.
34. As an **operator**, I want to approve waitlist cohorts, so that public launch can be gradual.
35. As a **User**, I want magic-link **Sign-in** from `issues/prd.md`, so that I do not manage passwords on mobile.
36. As a **returning User**, I want **session resume** to my last **Project** and **Thread**, so that I continue where I left off.
37. As a **User**, I want the **Sidebar** and **Thread** model from the shell PRD, so that navigation matches Cursor-like habits.
38. As a **User**, I want **Pair** hidden in production, so that I am not confused by developer-only flows.
39. As a **User**, I want **Data** and **Config** to stay **Coming soon** until real, so that the shell stays honest.
40. As a **User**, I want **Codex** to work end-to-end in dogfood, so that the core promise is proven.
41. As a **User**, I want **Claude Code** soon after **Codex**, so that I can choose Anthropic’s agent path.
42. As a **User**, I want **Cursor** integrated after a documented credential flow, so that my Cursor subscription can drive agents when wired.
43. As a **developer on the team**, I want a spike on Cursor Integrations / Cloud Agents API, so that we do not guess credential shape.
44. As a **User**, I want errors during workspace provision or connect to be actionable, so that failures are recoverable.
45. As a **User**, I want accessible labels on **Connect provider** and connect forms, so that screen readers and keyboard work.
46. As a **User**, I want status green only for connection health, so that UI matches the design system.
47. As an **operator**, I want metrics on **Hosted pool** load and failed **Agent runs**, so that I can scale or debug.
48. As a **User**, I want WebSocket connectivity to feel like “System: Connected”, so that I trust the remote environment is reachable.
49. As a **User**, I want to create multiple **Projects**, so that I can separate workstreams.
50. As a **User**, I want multiple **Threads** per **Project**, so that I can split tasks without new repos.
51. As a **future User**, I want a **Caqli-funded trial model** with a few free messages on a cheap model, so that I can try before BYO (optional, post-MVP).
52. As a **future enterprise User**, I want **Dedicated execution**, so that my workload is isolated (out of scope for MVP).
53. As a **User**, I want provider connect attempts audited without logging secret values, so that support can debug safely.
54. As a **User**, I want disconnect/reconnect of a provider, so that I can rotate keys on my provider dashboard.
55. As a **developer**, I want shared contracts for credential and usage events, so that client and server stay aligned.
56. As a **User**, I want deep links after auth to land in the app not marketing, so that magic links feel modern.
57. As a **User**, I want starter chips on empty **Threads** per shell PRD, so that first send is easy after connect.
58. As a **User**, I want the composer send affordance to match canonical design, so that the product feels cohesive.
59. As a **tester**, I want a documented dogfood checklist (sign-in → project → connect Codex → message → file in **Code**), so that releases are repeatable.
60. As a **maintainer**, I want dogfood and public gates documented, so that we do not ship the wrong scope to the wrong audience.

---

## Implementation Decisions

### Architectural (see ADR-0001)

- **Control plane** vs **Execution environment** separation: Postgres/Supabase for identity and metadata; **Hosted pool** T3 servers for workspaces and provider processes.
- **Shared hosted pool** for MVP; **Dedicated execution** and **Warm environment** deferred.
- **Ephemeral Agent runs** with persistent per-**Project** workspace storage.
- **Client** is remote control only (WebSocket/HTTP); no provider secret material in browser storage after connect.

### Modules (deep modules to build or extend)

| Module                                 | Responsibility                                                                                                                                           | Notes                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Provider credential vault**          | Accept connect input, envelope-encrypt, persist ciphertext, expose “connected / not” flags only to client, decrypt in execution layer for outbound calls | Master key via env/KMS; never log plaintext |
| **Hosted pool coordinator**            | Map **Project** → workspace path on pool; health checks; optional assignment of **Environment** to pool node                                             | Idempotent provision on project create      |
| **Connect provider flow**              | Onboarding route + API after first **Project**; renders Cursor/Codex/Claude Code rows with status                                                        | Port Stitch from meta onboarding reference  |
| **Agent provider registry**            | Known providers, launch order, “coming soon” vs active, maps to runtime `ProviderKind` + future Cursor kind                                              | Codex dogfood gate                          |
| **BYO outbound proxy**                 | When **Agent run** starts, resolve **Thread provider**, load ciphertext, decrypt in memory, inject into Codex/Claude adapters                            | Align with existing provider manager        |
| **Default / thread provider policy**   | Account default; per-thread binding at creation; reject provider swap mid-thread in MVP                                                                  | Pure decision module testable without UI    |
| **Agent run concurrency gate**         | Enforce one active run per **Project** (dogfood); configurable cap before public                                                                         | Server-side source of truth                 |
| **Usage gate (hosted compute)**        | Daily Caqli compute budget separate from BYO; soft-block UX                                                                                              | Extends issue 009                           |
| **Access control**                     | Invite allowlist for dogfood; waitlist capture + operator approve for public v1                                                                          | Supabase RLS or server flags                |
| **Hosted auth client**                 | From shell PRD (issue 001)                                                                                                                               | Outer gate for all modules                  |
| **Workspace provisioning coordinator** | From issue 003; empty workspace default                                                                                                                  | GitHub import hooks later                   |
| **Session resume controller**          | From issue 004                                                                                                                                           | Unchanged intent                            |

Check with implementer: these module boundaries are targets; merge or split if the codebase already has overlapping layers.

### Provider roadmap

- **Dogfood blocker:** **Codex** connect + one successful **Agent run** + file visible in **Code**.
- **Fast-follow:** **Claude Code** (`claudeAgent` runtime).
- **Third:** **Cursor** after Integrations/Cloud Agents API spike defines credential type and runtime adapter.
- **Connect provider** UI always lists all three with honest disabled/coming-soon states.

### Onboarding sequence (first-time)

Magic link → **Name your first project** (empty **Hosted workspace**) → **Connect provider** → **App** (**Chat** default). **Import from GitHub** optional post-create.

### Relationship to shell PRD (`issues/prd.md`)

- Shell/auth/sidebar/chat/code/usage UX remains as specified in `issues/prd.md` and issues 001–011.
- This PRD adds **execution hosting**, **BYO**, **provider connect**, and **access gating** not fully specified there.
- **Pair** remains dev-only for production **Users**.

### Schema / contracts (conceptual)

- **Provider credential** records: user id, provider kind, ciphertext, key version, created/updated, last used (no plaintext).
- **Project**: link to workspace location in pool, provision status.
- **User** / account: default provider, invite approved, waitlist status.
- **Usage limit**: Caqli compute counters per user per day.
- Evolve shared **contracts** package for connect events, usage block reasons, provider status enums (schema-only package).

### Security

- Application-level encryption before write to Postgres.
- Decrypt only in **Execution environment** process memory for provider calls.
- Supabase RLS: users read only their rows; no client SELECT on credential ciphertext via anon key patterns that leak secrets.

---

## Testing Decisions

- **Good tests** assert observable behavior: cannot read decrypted secrets from client APIs; connect flow returns only boolean/status; usage block prevents new turns but allows read routes; concurrency gate rejects second run on same **Project**; onboarding routes skip **Connect provider** when credentials exist.
- **Prior art:** Vitest in repo (`bun run test` per AGENTS.md); patterns from issue 001/004/009 modules once present.
- **Modules to prioritize for unit tests:** Provider credential vault (encrypt round-trip, never expose plaintext API), default/thread provider policy, agent run concurrency gate, usage gate mapping, access allowlist decisions.
- **Integration tests:** Server rejects agent turn without credentials; server enforces usage soft block; provision project creates workspace marker idempotently.
- **Dogfood checklist (manual/E2E):** Documented happy path in Further Notes; automate when Playwright harness agreed in shell PRD.

**Suggested test ownership:** vault, provider policy, concurrency gate, usage gate—unit first; full happy path—integration or E2E when harness exists.

---

## Out of Scope

- Native iOS/Android apps (MVP is mobile web; PWA v1.1).
- **Warm environment** and **Dedicated execution** paid tiers.
- **Caqli-funded trial model** (optional later).
- Per-message **Thread provider** switching.
- Unlimited parallel **Agent runs** per **Project** at dogfood.
- Requiring **Import from GitHub** before first message.
- Second production deployable (meta `caqli-onboarding` as live app).
- Decrypting or storing provider secrets in the browser.
- Bundling all model token costs into Caqli pricing for MVP.
- Fully open public signup on launch day (waitlist cohorts first).
- Replacing T3 WebSocket protocol with a custom transport.
- Shipping **Cursor** connect before spike confirms API and runtime adapter.

---

## Further Notes

- **Dogfood definition of done:** Invite-only **User** completes: magic link → first **Project** → **Connect provider** (**Codex**) → one **Agent** message → file change visible in **Code** tab.
- **Public definition of done:** Full `issues/prd.md` acceptance plus this PRD’s BYO/hosted pool/access items; waitlist approval flow live; **Claude Code** connect; concurrency cap per **Project**; PWA optional.
- **Design:** Port mobile-first Stitch flows from meta `apps/caqli-onboarding` into web-browser routes; tokens per `design/DESIGN-CENTRALIZED.md`.
- **Cursor spike deliverable:** Document credential type, required scopes, whether Cloud Agents API can target user **Hosted workspace**, and estimate for `ProviderKind` extension.
- **Meta repo:** Product-line glossary and ADR live at workspace root; keep `products/caqli-web-browser/CONTEXT.md` aligned when **Agent provider** terms are added there.
- **Issue slices:** `issues/013`–`020` and index `issues/README-hosted-epic.md` (implement on branch `feature/hosted-cloud-agent`).
