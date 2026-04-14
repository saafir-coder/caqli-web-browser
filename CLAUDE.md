# Caqli AI — Agent Brief

> Every Claude/Codex agent MUST read this file first before touching any code.
> Update the CHANGELOG section at the end of every session.

---

## What This Is

**Caqli AI** — browser-based AI coding assistant built specifically for Somali developers.
Free tier: 100 messages/day via Groq (Llama 3.1). Paid tier: Claude Sonnet (credit-based).
Also works as a Continue IDE backend via OpenAI-compatible API at `/api/v1/chat/completions`.

**Live URL:** Deployed on Vercel (check Vercel dashboard for current URL).
**GitHub:** `saafir-coder/caqli-ai`
**Branches:** `main` = production (users see this). `staging` = all work goes here first, tested, then merged to main.

**Owner:** Abdillahi — Somali developer building tools for Somali developers.

---

## Stack

| Layer | Tech | Why |
|---|---|---|
| Framework | Next.js 16 App Router + TypeScript | Full-stack in one repo, easy Vercel deploy |
| UI | React 19 + Tailwind 4 + Monaco Editor | Monaco = VS Code editor in browser |
| Auth + DB | Supabase | RLS, auth, postgres — no backend needed |
| Free AI | Groq → Llama 3.1 8B | Free, fast. OpenRouter was primary but both keys died |
| Paid AI | Anthropic → Claude Sonnet 4.6 | Best quality for paying users |
| Deploy | Vercel | Already live |

---

## Current State (as of 2026-04-14)

**Working:**
- Signup / login flow (email + password via Supabase)
- Free tier chat (Groq Llama 3.1) — 100 messages/day
- Paid tier chat (Claude Sonnet 4.6) — credit-based
- Monaco code editor with 7 languages
- Dashboard — setup wizard, API key display
- Admin panel at `/admin` — user list, credit top-up, password reset, conversation viewer
- OpenAI-compatible proxy `/api/v1/chat/completions` for Continue IDE
- Streaming responses

**Known issues / in progress:**
- Payment integration missing — credits added manually by admin via `/api/admin/topup`
- Chat history not loaded on session resume (saved to DB but not displayed on return)
- Email verification skipped — users confirmed immediately on signup
- No error monitoring (Sentry not set up)

**Not done:**
- Stripe / LemonSqueezy payment
- Full Somali UI localization
- OAuth (callback route exists, social login not configured)
- Usage analytics dashboard (data exists in `usage_log`, no UI)

---

## Critical Rules — Do Not Break These

1. **Never push directly to `main`.** All changes go to `staging` first. Build must pass. Then merge.
2. **The admin password is the Supabase service role key** passed as `x-admin-key` header. Simple but intentional for MVP.
3. **Free tier uses Groq as primary** — OpenRouter keys are dead (both returned 404). Do not switch back to OpenRouter without testing the key first.
4. **`lib/pending-signups.ts` is dead code** — leftover from abandoned magic link flow. Ignore it.
5. **`.env.local` is never committed** — it contains live API keys.

---

## Architecture Decisions (Why Things Are The Way They Are)

### Why Groq instead of OpenRouter?
Both OpenRouter keys died (404) in April 2026. Groq key works and is free. The cascade in `lib/groq.ts` tries OpenRouter first (in case keys are replaced) then falls to Groq on any failure.

### Why is the cascade in `lib/groq.ts` and not `lib/openrouter.ts`?
`lib/openrouter.ts` is legacy dead code — it only has OpenRouter, no fallback. `lib/groq.ts` has the full cascade (OpenRouter → Groq pool). The chat route imports from `lib/groq.ts`. Do not use `lib/openrouter.ts`.

### Why is admin auth just the service role key?
MVP decision. Fast to implement. The admin panel is not linked from anywhere — you have to know the URL (`/admin`). Acceptable for the current number of users.

### Why no email verification?
Supabase requires SMTP setup for verification emails. Skipped for MVP to reduce friction for early Somali users who might not trust the flow. To add: configure Supabase SMTP + set `autoConfirm: false`.

### Why Supabase over Firebase/PlanetScale?
Row-level security built in. Auth + DB in one place. Free tier sufficient for current scale. Abdillahi already knows it.

### Why Monaco Editor?
It's the VS Code editor engine. Somali developers who know VS Code feel at home. Simpler alternatives (CodeMirror, textarea) felt like a downgrade for the target audience.

---

## Key Files — What Each One Does

```
app/api/chat/route.ts          ← Core: routes free/paid chat, saves messages to DB
app/api/admin/users/route.ts   ← Admin: returns all users with credits, usage, last active, total messages
app/api/admin/messages/route.ts ← Admin: returns conversation history for a specific user
lib/groq.ts                    ← AI cascade: OpenRouter first → Groq fallback (USE THIS for free AI)
lib/openrouter.ts              ← DEAD CODE — do not use, not imported anywhere active
lib/openrouter-pool.ts         ← Key rotation pool — used by lib/groq.ts
lib/anthropic.ts               ← Paid tier AI (Claude Sonnet)
lib/pricing.ts                 ← Token → credit conversion (2.5x markup)
middleware.ts                  ← Protects /editor and /dashboard — redirects to /login if no session
supabase/schema.sql            ← Full DB schema — read this before touching DB queries
supabase/api-keys-schema.sql   ← API keys table + usage_log — applied separately, must exist in DB
```

---

## Environment Variables (what each one does)

```env
NEXT_PUBLIC_SUPABASE_URL          — Supabase project URL (public, safe in browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY     — Supabase anon key (public, safe in browser)
SUPABASE_SERVICE_ROLE_KEY         — Supabase admin key — bypasses RLS. Used in admin routes + admin panel password
OPENROUTER_API_KEY                — Dead key. Still in env as fallback in case it gets replaced
GROQ_API_KEY_1                    — Active free AI key. Groq Llama 3.1 8B. Works as of 2026-04-14
ANTHROPIC_API_KEY                 — Paid tier. Claude Sonnet 4.6
```

---

## Database Tables (quick reference)

| Table | Purpose |
|---|---|
| `auth.users` | Supabase managed. `user_metadata.api_key` = caqli_* key |
| `public.profiles` | Extended profile: name, country, tier, source |
| `public.credits` | balance + total_purchased per user |
| `public.messages` | Full chat history — role, content, model_used, tier |
| `public.daily_usage` | Free tier counter — (user_id, date) unique |
| `public.api_keys` | caqli_* keys for Continue IDE |
| `public.usage_log` | Per-request token/cost log |

**Key triggers:**
- `handle_new_user()` — fires on signup → auto-creates `profiles` + `credits` rows
- `generate_api_key()` — fires on profile creation → creates `caqli_<24hex>` key

---

## CHANGELOG

### 2026-04-14 — Session with Abdillahi

**Added:**
- `app/api/admin/messages/route.ts` — new admin endpoint, fetch conversation history per user
- Admin panel conversation viewer — click any user row to see their full chat history
- Admin panel error detection — messages with `[Error:` highlighted in red with count badge
- Admin panel `last_active` + `total_messages` + `Active Users` stat card
- Editor beta banner — amber bar in Somali + English, dismissible, persists via localStorage
- `CLAUDE.md` — this file (agent briefing + changelog system)
- `staging` branch on GitHub — all future work goes here before merging to main

**Fixed:**
- **Critical:** Groq env var was `Grog_API_KEY` (typo) — renamed to `GROQ_API_KEY_1`. Groq fallback was never activating.
- **Critical:** Both OpenRouter keys dead (404). Cascade catch only skipped 429, so 404 threw error instead of falling to Groq. Fixed to catch any OpenRouter failure.
- Result: free tier AI (Groq Llama 3.1) now works correctly

**Discovered:**
- No messages in DB for any registered user — caused by the Groq env typo + dead OpenRouter keys. Every chat silently failed.
- App IS deployed on Vercel (was incorrectly assumed undeployed — verify URL in Vercel dashboard)

**Not merged to main yet** — staging branch, pending verification
