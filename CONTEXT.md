# Caqli AI Web Browser

Browser-first agent workspace (fork of T3 Code). Users run coding agents per workspace folder; Caqli hosts accounts and metadata for early adopters while agent compute may be offered on a limited free tier.

## Language

**User**:
A person who signs up with email and uses Caqli through the web app (any device form factor).
_Avoid_: Customer, account (when meaning login identity).

**Onboarding**:
The first-run guided flow after signup (or first visit) that ends with a usable workspace—not marketing pages or email capture alone.
_Avoid_: Welcome tour (implies post-setup tips only).

**Landing page**:
Marketing / value-prop page at the public link; primary job is trust and email capture before product access.
_v1_: Single **Email** field and one primary CTA; **magic link** is the same path for new and returning **Users** (optional subcopy that the inbox link works for either).
_Avoid_: Home screen, dashboard.

**Project** (user-facing):
What the user names and connects during onboarding—their unit of work in Caqli (folder/repo + agent context).
_Avoid_: Environment (user-facing wording); see **Environment (implementation)** for code mapping.

**Connect** (project):
Attaching a named **Project** to a runnable workspace during **Onboarding**.
_v1_: Caqli creates a **Hosted workspace** (cloud folder owned by the user). _Step 2_: optional **GitHub** link to clone an existing repo into that workspace.
_Avoid_: **Pair** (see **Pair** — dev-only; not the **User**’s **Project** connection story in v1).

**Pair**:
Internal flow linking the web client to a **User**-operated or local **server** (T3 self-host path; e.g. `/pair`). _v1 **Hosted tier** **Users**:_ **Hidden**—no production navigation, CTAs, or settings entry; shipped app is **Sign-in** + **Hosted workspace** only. **Pair** may remain in the repo for **development** / local builds only.
_Avoid_: Offering **Pair** alongside hosted auth as a first-class **User** path in v1.

**Hosted workspace**:
An empty cloud folder/repo Caqli provisions for a new **Project** so the agent has somewhere to read and write files. Lives on **Hosted tier** infra.
_Avoid_: Sandbox, container (implementation detail, not user concept).

**Sidebar**:
Persistent left rail listing the **User**'s **Projects** as collapsible section headers, with the **Threads** under each project nested as rows. Modeled on Cursor's agent panel. Collapses to a drawer on phone; always visible on desktop and tablet.
_Layout rules_: `+ New project` at the top; `+ New thread` inside each project header; a new user's single project is auto-expanded so the empty state is visible.
_Avoid_: Drawer, panel (those describe the mobile-only collapsed mode, not the term itself).

**Thread**:
A single conversation with an **Agent** inside a **Project**. Shown as a row under its project in the **Sidebar**; opening it loads the chat history.
_Avoid_: Chat, session (overloaded—"session" is auth in code).

**Code** (UI surface):
Where the **User** inspects the current **Project**’s **Hosted workspace**—folder structure, files, and an editor view of file contents the **Agent** creates or modifies. Distinct from **Chat**; on **phone** it is a primary shell destination (e.g. bottom nav). **Chat** stays the default entry; **Code** is first-class, not an afterthought.
_Avoid_: Using “code” alone when you mean this UI—say **Code** surface or **Code** tab.

**Data** / **Config** (UI, deferred):
Shell destinations that may sit beside **Chat** and **Code** on small screens. _v1_: Keep nav continuity if desired, but treat as **Coming soon**—tap shows lightweight placeholder (honest messaging), **not** a scoped product surface in v1. **PRD** focus remains **Chat** + **Code** + onboarding/auth/hosted core.

**Environment** (implementation):
The codebase’s runtime workspace object. **v1 mapping:** exactly one **Environment** per user-facing **Project** (1:1)—creating a **Project** creates its **Hosted workspace** backing **Environment**; no shared **Environment** across multiple **Projects** in v1.

**Agent**:
The coding assistant that runs inside a **Project**'s **Hosted workspace**, reads/writes files there, and converses through a **Thread**. Multiple **Agents** can run in the same project.
_Avoid_: Bot, assistant (too generic).

**Agent provider**:
Which product runs the **Agent** for a **Thread**—**Codex**, **Claude Code**, or **Cursor** (BYO). See `issues/prd-hosted-cloud-agent.md` and meta ADR `0001-hosted-agent-architecture`.

**Connect provider**:
Onboarding step after first **Project**: link **Provider credentials** (server vault); list all three **Agent providers** with honest **Coming soon** until wired.
_Avoid_: Exposing API keys to the browser after connect.

**Hosted tier**:
Caqli-operated backend that stores user identity, projects, and usage limits for the first ~100–200 users.
_v1 engineering (\_PRD scope_):_ Ship **minimum viable hosted** in this repo—multi-tenant persistence for **User**, **Project**, **Thread**, **Usage limit**, and **Session resume**; **Sign-in** via magic link; each **Project** backed by a **Hosted workspace** (1:1 **Environment**). **Production:** **control plane Postgres + API on Caqli VPS**; workspace files in object storage (e.g. R2); **T3 hosted pool** on the same fleet. Meta ADR: `caqli` repo [docs/adr/0001-hosted-agent-architecture.md](../../../docs/adr/0001-hosted-agent-architecture.md). Interim Supabase-in-browser code is dogfood-only until migrated. **Pair** stays **dev-only** for v1 production **Users** (see **Pair**).
\_Avoid_: Cloud MVP (legacy product in `caqli-cloud-legacy`).

**Usage limit**:
Daily cap on agent usage for free-tier **Users** until they upgrade.
_v1 UX (when cap reached):_ **Soft block** — **User** can still open the **App**, browse **Projects**/**Threads**, open the **Code** surface for reading (and history in **Chat**); **new agent turns** (sends / tool work) are blocked with clear in-app messaging (banner + composer affordance) and an upgrade / wait-until-reset path when available. _Avoid_ locking the **User** out of read-only navigation.

**Sign-in**:
How a **User** proves identity after **Email** on the landing page.
_v1_: magic link (inbox link completes session). _Later_: optional Google OAuth.
_Avoid_: Password-first signup (not v1).

## First-visit journey (resolved)

1. Public **link**
2. **Landing page** (value proposition)
3. **Email** capture → magic-link sent (`Check your inbox` screen)
4. User clicks magic link → authenticated **session**; **User** is taken into the **App** (chat-primary shell), not back to the **Landing page**
5. **If** the **User** has no **Projects** yet — **Onboarding**: single screen **Name your first project** (user-facing: create / name first **Project**; pre-filled suggestion, Enter to accept). **Hosted workspace** provisions in background.
6. **App** entry — sidebar + chat composer. **If** the **User** already has a **Project**, skip step 5 and open **App** with the **last active** **Project** and **Thread** restored (see **Session resume**).

**Post–magic-link intent:** After the inbox link, the experience should feel like landing **straight in the product chat**, not extra marketing steps—**Onboarding** is only the name-project gate for first-time **Users**.

**Session resume**:
After a returning **User** completes magic-link auth, **App** opens on the **last active** **Project** and **Thread** (persist per **User**; update whenever they switch **Project**/**Thread** or on idle/close if practical). If that **Thread** no longer exists, fall back to the **Project**’s most recently updated **Thread**, then to a new **Thread** in that **Project**, then to first **Project** in sidebar order—exact fallback order for PRD acceptance criteria.

## Relationships

- A **User** signs up via **Email**; a first-time **User** completes **Onboarding** once, then owns one or more **Projects**
- **Landing page** is shown before **Email**; **Onboarding** runs only when an authenticated **User** has zero **Projects**
- **Hosted tier** persists **User** and **Project** metadata; agent sessions may run against Caqli-managed resources
- A **Project** has one **Hosted workspace** and many **Threads**
- A **Thread** runs one **Agent** inside the parent **Project**'s **Hosted workspace**
- The **Sidebar** is the entry point to every **Project** and **Thread**
- The **Code** surface reflects the same **Hosted workspace** the **Agent** uses for the active **Project**

## App entry state (resolved)

When **Onboarding** ends (first **Project** created), the **User** lands on:

- **Sidebar** open (left), showing the just-created **Project** with a fresh **Thread** under it
- **Chat composer** focused on the right with a "What do you want to build?" placeholder and **three starter prompt chips** (_v1 copy_): **Add a README for this project** · **Fix the failing test** · **Suggest a project structure**
- The **App** shell includes **Chat** (default) and **Code** (file tree + editor for the **Project** workspace); **User** starts in **Chat**, not **Code**

When a **returning** **User** enters via magic link, **App** opens on **Session resume** (**last active** **Project**/**Thread**) instead of **Onboarding**; composer/chips behave per current **Thread** (empty **Thread** → same empty-state pattern where applicable).

## Visual direction (resolved — app surface)

Reference: **AnyCoder** screenshot supplied 2026-05-15 (authoritative).

- **Mode**: true black background (`#000000`), not charcoal marketing dark
- **Surfaces**: panel fill `~#1A1A1A`–`#2B2B2B`, borders `~#333333`; no heavy shadows
- **Text**: white primary, muted gray secondary (`~#9CA3AF` / `~#A0A0A0`)
- **Buttons**: dark gray fill + white label (AnyCoder "New Chat" style)—**not** neon green CTAs
- **Accent green**: **status only**—small "Connected" dot (`~#22C55E`), optional active sidebar indicator; never full-width green buttons
- **Chat**: user bubble white + black text; agent bubble dark gray + light gray text; timestamps small muted
- **Composer**: dark rounded input bar + **circular** dark send button with arrow (not green pill)
- **Landing page**: same AnyCoder palette—minimal, not loud marketing gradients

**Stitch (canonical):** Single brand across desktop + mobile; canonical **mobile** frames (Combined Workspace, Sidebar Open, AI Agent Workspace Flow — see `design/stitch-canonical-snapshot.json`) are the reference for logo/header/controls. Iterate only in [Centralized](https://stitch.withgoogle.com/projects/12071567403384356189) — see `docs/RESEARCH-HANDOFF.md` and `design/DESIGN-CENTRALIZED.md`.

## Example dialogue

> **Dev:** "When a **User** finishes **Onboarding**, are they in a **Project** or still choosing one?"
> **Product:** "They must create and **connect** a **Project** before chat—that's onboarding complete."

## Flagged ambiguities

- ~~**Project** vs **Environment**~~: **Resolved (v1)** — 1:1 per glossary **Environment (implementation)**.
- ~~**Where data lives**~~: **Resolved (_v1 PRD_)** — **Hosted tier** ships as **minimum viable hosted** in this product repo (see **Hosted tier** _v1 engineering_); replaces pairing-only assumptions for production **Users**.
- **Google OAuth timing**: optional add-on after magic link ships—not yet scheduled.
- ~~**Pair vs hosted (Q7)**~~: **Resolved (_v1_)** — **Pair** **hidden** from production **Hosted tier** **Users**; dev/local only (see **Pair**).
- ~~**Data / Config shell tabs**~~: **Resolved (_v1_)** — may appear in mobile nav but **Coming soon** placeholder only; see **Data** / **Config** (UI, deferred).
- ~~**Default Project/Thread after magic link (returning User)**~~: **Resolved** — **last active** **Project** and **Thread**; fallback chain in **Session resume** (finalize ordering in PRD).
- ~~**Empty-state starter prompt copy**~~: **Resolved (_v1_)** — **Add a README for this project**; **Fix the failing test**; **Suggest a project structure** (see **App entry state**).
