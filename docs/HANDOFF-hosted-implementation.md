# Handoff — hosted implementation (for next agent)

**Branch:** `feature/hosted-cloud-agent`  
**Last implementation commit:** `bac12920` (dogfood slices 013–015, **Supabase interim**)  
**Architecture (source of truth):** meta repo [ADR-0001](https://github.com/saafir-coder/caqli/blob/main/docs/adr/0001-hosted-agent-architecture.md), [hosted-vps-infrastructure](https://github.com/saafir-coder/caqli/blob/main/docs/hosted-vps-infrastructure.md)

## What is already built (code on branch)

| Area | Status | Notes |
|------|--------|--------|
| **013 Invite gate** | Done (client-only) | `accessAllowlist.ts`, `checkHostedAccess.ts`, welcome/callback/chat/access-denied; env allowlist; **not** server API yet |
| **001 Magic link UI** | Partial | `/welcome`, `/check-email`, `/auth/callback` via **Supabase Auth** |
| **003/014 Onboarding + project row** | Partial | `/onboarding` → `createHostedProject()` → **Supabase** `hosted_projects`; `pool/{userId}/{projectId}` path only in DB |
| **015 Connect provider** | Stub | `/connect-provider`, registry; Codex = **localStorage** stub (`hostedCodexConnection.ts`), no vault |
| **016 Dogfood Codex turn** | **Not started** | No BYO proxy, no real agent → file in Code |
| **017–020** | **Not started** | |
| **apps/server hosted API** | **Not started** | No Postgres on VPS, no magic-link API, no R2 |
| **Shell 005–012** | Mostly **not** done | Sidebar/server persistence still T3 pairing model |

**Tests:** `accessAllowlist.test.ts`, `poolWorkspace.test.ts` pass. Run `bun run test`, `bun typecheck` from product root.

## Architecture decision (do not reverse)

**Production = Caqli VPS** (control plane Postgres + API + T3 pool) + **object storage** (R2) for workspace files.

**Current code = interim:** browser talks to **Supabase** for auth + `hosted_projects`. That is **dogfood scaffolding**, not the target. Next work should **add server APIs** and **migrate web off Supabase**, not extend Supabase RLS.

## Recommended implementation order (next agent)

1. **VPS control plane foundation** — Postgres on VPS, migrations (from `supabase/migrations/…` neutralized), `apps/server` routes: health, session, allowlist, `POST /hosted/projects`.
2. **Magic link on server** — replace `signInWithOtp` with server-issued links; web uses `VITE_API_URL` only.
3. **016** — credential vault + BYO Codex proxy + one turn → file in Code (pool `cwd` + R2 when ready).
4. **017–020** — per `issues/README-hosted-epic.md`.

## Key paths

```
apps/web/src/hosted/          # client hosted modules (Supabase today)
apps/web/src/routes/welcome.tsx, onboarding.tsx, connect-provider.tsx, …
supabase/migrations/          # interim schema; move to server migrations
issues/013-*.md … 020-*.md    # vertical slice specs
issues/README-hosted-epic.md  # order + GitHub mirror table
```

## Env today (interim)

```env
VITE_SUPABASE_URL=…
VITE_SUPABASE_ANON_KEY=…
VITE_HOSTED_ACCESS_MODE=invite
VITE_HOSTED_ALLOWLIST_EMAILS=you@example.com
```

## Env target (VPS)

```env
VITE_API_URL=https://your-vps-origin
# no VITE_SUPABASE_* in production
```

## Out of scope for next slice

- Do not add new Supabase tables/features unless needed for one-week dogfood; prefer server Postgres.
- Unrelated `apps/desktop/*` changes on branch — ignore unless explicitly tasked.

## VPS reference (Hostinger)

Running VM: see meta Hostinger MCP / operator notes. Dogfood access doc: `docs/hosted-dogfood-access.md`.
