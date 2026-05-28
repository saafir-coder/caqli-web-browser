# PRD — Caqli AI Web Browser: Hosted auth, onboarding, and app shell (v1)

**Product:** Caqli AI Web Browser (`products/caqli-web-browser`)  
**Domain glossary:** `CONTEXT.md` (authoritative terminology)  
**Design:** `design/DESIGN-CENTRALIZED.md`, canonical Stitch project “Caqli — Centralized (canonical brand)”, `design/stitch-canonical-snapshot.json`  
**Research handoff:** `docs/RESEARCH-HANDOFF.md`  
**Date:** 2026-05-15

---

## Problem Statement

Developers who want a **browser-first** agent workspace need a **trustworthy, low-friction** path from a public link to a **real project**: sign in without password friction, name (or create) a first **Project**, land in **chat** with a clear empty state, and **inspect files** the **Agent** touches—on **desktop, tablet, and phone**.

Today the codebase is a **T3 Code** fork tuned for **self-hosted / pairing** style flows and **Environment** + **Thread** URLs, without production **multi-tenant** identity, **magic-link** auth, or a complete **marketing → inbox → onboarding → app** journey aligned to the accepted visual system. **Users** need the hosted product to feel like **one coherent app** (not a demo shell), while the team needs a **bounded v1** that can ship to the first **~100–200** accounts with **usage limits** and honest **“coming soon”** areas where features are not ready.

---

## Solution

Ship **minimum viable hosted** in this repo: **magic-link** **Sign-in**, persistence for **User**, **Project**, **Thread**, **session resume**, and **usage limits**, with each **Project** backed by a **Hosted workspace** mapped **1:1** to the runtime **Environment** model.

Deliver **four** onboarding-era surfaces plus the **app shell**: **Landing** (single email + one CTA), **Check your inbox**, **Name your first project**, and **App** entry (**Chat** default, **Code** for tree + editor). **Returning Users** skip project creation and land on **last active** **Project** and **Thread** (with a defined fallback order if state is missing). **Pair** remains **developer-only**; production **Users** never see pairing as a primary path. **Data** and **Config** nav slots may appear but only as **Coming soon** placeholders. **Free tier** enforces a **daily cap** with a **soft block** (read-only **Chat**/**Code** allowed; **new agent turns** blocked with clear messaging).

Visual and UX details follow the **AnyCoder**-aligned, mobile-led canonical **Stitch** frames and centralized tokens (true black base, gray chrome, **green reserved for status** only).

---

## User Stories

1. As a **developer**, I want a **Landing page** that explains value and feels like a serious IDE-adjacent product, so that I **trust** Caqli enough to enter my email.
2. As a **User**, I want a **single email field** and **one primary action** (no separate “sign up” vs “sign in” maze), so that **magic link** works the same whether I’m new or returning.
3. As a **User**, I want **optional subcopy** that the inbox link works for **new or existing** accounts, so that I’m not confused about which path I’m on.
4. As a **User**, after submitting my email, I want a **Check your inbox** screen that matches design tokens and mobile/desktop layouts, so that I know what to do next.
5. As a **User**, when I click the magic link, I want to land **inside the product** (not the public marketing page), so that the handoff feels **immediate**.
6. As a **first-time User**, I want a single **Name your first project** step with a **suggested default** I can accept with **Enter**, so that onboarding is **fast** and not a wizard.
7. As a **first-time User**, I want my **Project** to get a **Hosted workspace** provisioned **without extra technical steps**, so that the **Agent** has a real place to work.
8. As a **returning User** with at least one **Project**, I want to **skip** name-project onboarding, so that I return **straight to work**.
9. As a **returning User**, I want the app to open my **last active** **Project** and **Thread**, so that I regain **context** like in a serious dev tool.
10. As a **returning User**, if my last **Thread** is gone, I want a **predictable fallback** (e.g. most recent thread in that project → new thread in project → first project), so that the app **never dead-ends**.
11. As a **User**, I want a **Sidebar** with **Projects** as sections and **Threads** nested underneath, so that navigation matches **Cursor-style** mental models.
12. As a **User**, I want **+ New project** and **+ New thread** in the **Sidebar** in the agreed layout, so that I can expand work **without hunting**.
13. As a **new User**, I want my **first Project** **auto-expanded** in the sidebar, so that the **empty chat** state is obvious.
14. As a **User**, when I enter **App** after onboarding, I want **Chat** as the **default** surface with composer focused and **“What do you want to build?”**, so that the primary action is **obvious**.
15. As a **User**, I want **three starter chips**—**Add a README for this project**, **Fix the failing test**, **Suggest a project structure**—so that I can start with **one tap**.
16. As a **User**, I want a **Code** surface (tab on mobile, equivalent on desktop) showing **file tree** and **editor** for files in the active **Project** workspace, so that I can **see what the Agent changed**.
17. As a **User**, I want **Chat** and **Code** to reflect the **same** **Hosted workspace** for the selected **Project**, so that I don’t see **divergent** realities.
18. As a **User** on **phone**, I want the **sidebar** as a **drawer** with clear open/close affordances, so that small screens stay **usable**.
19. As a **User** on **tablet/desktop**, I want a **persistent** sidebar where appropriate, so that density matches **larger** screens.
20. As a **User**, if I tap **Data** or **Config** in the shell, I want an honest **Coming soon** placeholder, so that I’m not sold **fake** features.
21. As a **free-tier User** who hit the **daily cap**, I want to **still read** **Chat** history and **browse** **Code**, so that I’m not **locked out** of my work.
22. As a **free-tier User** who hit the cap, I want **new agent turns** clearly **blocked** with messaging on the **composer** and/or **banner**, so that limits feel **fair and understandable**.
23. As a **User**, I want **accent green** only for **status** (e.g. connected dot, optional active thread indicator), so that the UI doesn’t feel like generic **“AI neon”** marketing.
24. As a **User**, I want **dark gray buttons** and **true black** background per the design system, so that the product matches the **AnyCoder**-style reference.
25. As a **User**, I want **Inter** (and mono for code/timestamps where specified), so that typography feels **professional** and **readable**.
26. As a **User**, I want the **composer** to use a **circular dark send** affordance (not a green pill), so that controls match the **canonical** design.
27. As a **User** with multiple **Projects**, I want switching **Projects** to change **Thread** list and **Code** workspace context, so that isolation is **clear**.
28. As a **User**, I want **magic link** to be the **only** required auth in v1, so that **password** management is **avoided**.
29. As an **operator**, I want **Pair** hidden from production **Users**, so that **hosted** onboarding isn’t confused with **developer pairing**.
30. As a **developer on the Caqli team**, I want **Pair** still available in **local/dev** flows, so that we can **debug** the stack.
31. As a **User**, I want errors during auth or workspace provisioning to be **actionable** (retry, contact, or clear state), so that failures don’t feel **mysterious**.
32. As a **User**, I want **session** persistence appropriate to **hosted** auth, so that I’m not logged out **capriciously** on refresh.
33. As a **User**, I want **accessible** focus order and labels on landing, inbox, onboarding, and shell controls, so that keyboard and AT users are **not excluded**.
34. As a **User**, I want **consistent** header/wordmark rhythm across **mobile-led** canonical frames and **desktop** layouts (layout only differs), so that the brand feels **one product**.
35. As a **User**, I want **Project Settings** (where designed) to align with centralized **Stitch** for **desktop**, so that settings don’t look like a **different product**.
36. As a **security-conscious User**, I want **Hosted tier** data boundaries such that my **Projects** and **Threads** are **scoped to my account**, so that multi-tenancy is **safe**.
37. As a **User**, I want the **Starter chips** on an **empty Thread** only when appropriate, so that chips aren’t **noise** on active conversations.
38. As a **User**, I want **timestamps** and **chat bubbles** to follow the **resolved** light/dark bubble pattern, so that conversations are **scannable**.
39. As a **mobile User**, I want **bottom nav** (where used) to keep **Chat** and **Code** **reachable**, so that core work stays **thumb-friendly**.
40. As a **Product owner**, I want the implementation to **map User Project 1:1 Environment**, so that engineering and domain language **stay aligned**.
41. As a **User**, I want **landing** and **app** to avoid **purple gradients / AI slop**, so that Caqli feels **purpose-built** for developers.
42. As a **User**, when provisioning is slow, I want **honest loading** states on onboarding, so that I don’t think the app **hung**.
43. As a **returning User**, I want **deep links** (where applicable) to **not** strand me on **Landing** after I’m already authenticated, so that navigation feels **modern**.
44. As a **User**, I want **usage limit** reset semantics documented in product copy (even if simple), so that I understand **when** I can send again.
45. As a **future User**, I want the PRD to leave **Google OAuth** as an explicit **later** addition, so that v1 doesn’t **creep**.

---

## Implementation Decisions

- **Product boundary (v1):** **Hosted** path is the **only** production **User** journey; **Pair** is **not** exposed in production UI (remains for **development/local** only).
- **Auth:** **Magic link** only for v1 **Sign-in**; **Google OAuth** explicitly **later**.
- **Tenancy model:** Persist **User**, **Project**, **Thread**, **usage accounting**, and **session resume** state on the **Hosted tier**; prefer **managed Auth + Postgres** (implementation may use **Supabase** or equivalent—vendor is an implementation choice, not a domain term).
- **Domain mapping:** **User-facing Project** maps **1:1** to internal **Environment** (runtime workspace); creating a **Project** creates exactly one backing **Environment** / **Hosted workspace**.
- **Routing / shell:** Public routes for **Landing**, **Check inbox**, and auth callbacks; authenticated **App** shell for **Chat** (default), **Code**, and deferred **Data**/**Config** placeholders. Existing **chat** routing today is organized around **environment** and **thread** identifiers—evolve URL strategy to align with **Project**/**Thread** semantics while preserving deep-linking expectations.
- **Root layout behavior:** Today the **root route** coordinates **environment readiness** and an **auth gate** concept; extend this pattern for **hosted** identity (e.g. treat “no hosted session” like today’s gate) without leaking **Pair** into production navigation.
- **Onboarding gate:** If authenticated **User** has **zero Projects**, route to **Name your first project** before full **App** access.
- **Session resume:** Persist **last active Project + Thread** per **User**; implement the agreed **fallback chain** for missing threads/projects (finalize exact order in acceptance criteria).
- **Workspace:** **Hosted workspace** provisioning runs on **Project** creation; failures surface **actionable** UX on the onboarding screen.
- **Agent integration:** Continue to broker agent sessions per **Project**/**Thread** through the **existing WebSocket + provider** architecture; hosted identity becomes the **outer** gate and metadata source.
- **Code surface:** **File tree + editor** reads from the same workspace backing the **active Project**; align with current editor/file-subsystem boundaries where they exist, extending as needed.
- **Usage limits:** **Daily** cap for free tier; enforce on **new agent turns** server-side with **soft-block** UX (client reflects server decisions).
- **Design system:** Implement **DESIGN-CENTRALIZED** tokens and rules (black base, gray panels/buttons, `#22C55E` only for **status**, **Inter**, grid, flat depth); reconcile any legacy token exports with **AnyCoder** narrative (background **#000000** vs YAML surfaces—pick a single **runtime** token mapping for implementation).
- **Mobile-led parity:** When **desktop** and **mobile** diverge, **realign desktop to canonical mobile** frames for **wordmark/header/controls** (per design doc).
- **Contracts:** Evolve **shared contracts** (schemas/types) for any new **auth**, **project**, or **usage** events that cross client/server boundaries—keep **`packages/contracts`** as **schema-only**.
- **Deep modules (target shape):**
  - **Hosted auth client:** small API surface (session observe, sign-in, sign-out, magic-link completion) hiding provider details.
  - **Project & thread directory:** CRUD + listing + “active selection” rules independent of React components.
  - **Session resume controller:** encapsulates persistence + fallback chain + migration as URL/schema evolve.
  - **Usage gate:** single place translating meter state → UI **block/allow** for turns.
  - **Workspace provisioning coordinator:** encapsulates async provision + idempotency + error taxonomy.
  - **Shell navigation policy:** decides which tab/surface is default and how **Coming soon** routes behave.

**Module / test scope check (for the team):** Confirm these module boundaries match expectations and which of the above warrant **unit** vs **integration** tests first (see **Testing Decisions**).

---

## Testing Decisions

- **Good tests** assert **observable behavior** and **contracts** (routing guards, “cannot send when soft-blocked”, onboarding gating, session resume selection rules) rather than **component implementation details**.
- **Modules to prioritize for automated tests:** **Session resume controller** (fallback ordering), **usage gate** mapping, **onboarding gate** (zero-project routing), and **auth completion** edge cases (expired link, already signed-in).
- **Prior art:** Follow existing **Vitest** setup (`bun run test` per `AGENTS.md`) and any **browser** test config already present for UI flows that need a real DOM.
- **Suggested split:** **Unit** tests for pure decision modules (resume, gating); **integration** tests for **server** enforcement of usage limits; **smoke** tests for **critical routes** once hosted auth is wired.

**Team check:** Confirm whether **E2E** (e.g. Playwright) is in scope for v1 or deferred; PRD assumes **minimum** E2E until a harness is chosen.

---

## Out of Scope

- **Google OAuth** (explicitly later).
- **Full GitHub connect** flow (**clone repo into hosted workspace**) unless promoted from “settings / step 2” into a separate milestone—**not** required to ship core hosted onboarding in v1.
- **Electron / desktop app** productization; repo may contain **Electron** affordances, but **v1 PRD** targets **hosted web**.
- **Data** and **Config** as **real** product surfaces (placeholders only).
- **Pair** as a **User-facing** production feature.
- **Multi-product** work (**caqli-cloud-legacy**, other parked repos).
- **Exact** free-tier **numeric** limits and **billing** integration (define limits in a **separate** pricing/ops decision; PRD only requires **soft-block** UX and **daily** semantics).
- **Neon green marketing CTAs** and **AI-slop** visual patterns (explicitly rejected).

---

## Further Notes

- **Design sources of truth:** Canonical **Stitch** project + `design/DESIGN-CENTRALIZED.md` + `design/stitch-canonical-snapshot.json`; local **`onboarding-preview.html`** as a palette/layout sanity check. **Figma** onboarding file is **not** authoritative per handoff.
- **Acceptance:** Acceptance criteria should trace to **`CONTEXT.md`** decisions (especially **Session resume** fallback ordering and **soft block** behavior).
- **Open operational items:** Magic-link deliverability, abuse controls, and rate limits on auth endpoints—the PRD assumes **standard** best practices but does not specify vendors.
- **URL / branding:** Keep **Caqli** naming consistent; avoid user-facing “environment” wording—use **Project**.
- **Pairing code:** Utilities for pairing URLs may remain in the codebase for **dev**; production builds should **not** advertise them.

---

## Document history

| Version | Date       | Notes                                                                          |
| ------- | ---------- | ------------------------------------------------------------------------------ |
| 1.0     | 2026-05-15 | Initial PRD from `CONTEXT.md`, design docs, handoff, and codebase orientation. |
