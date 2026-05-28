# Hosted dogfood access (invite-only gate)

During dogfood, only operator-approved emails may use the hosted Caqli web app (magic-link auth). Enforcement runs at three points:

1. **`/welcome`** — before `signInWithOtp` (no magic link sent for blocked emails).
2. **`/auth/callback`** — after session is established; blocked users are signed out with a clear message.
3. **`/_chat` `beforeLoad`** — if a session slips through, sign out and redirect to `/access-denied`.

Allowlist logic lives in `apps/web/src/hosted/accessAllowlist.ts` (pure decision module + Vitest tests).

## Environment variables

Set these in your Vite env (e.g. `.env.local`, Vercel project env, or deploy config). All are read in the **browser** build (`import.meta.env`).

| Variable                       | Values                 | Default when hosted auth is on |
| ------------------------------ | ---------------------- | ------------------------------ |
| `VITE_SUPABASE_URL`            | Supabase project URL   | — (required for hosted auth)   |
| `VITE_SUPABASE_ANON_KEY`       | Supabase anon key      | — (required for hosted auth)   |
| `VITE_HOSTED_ACCESS_MODE`      | `open` \| `invite`     | `invite`                       |
| `VITE_HOSTED_ALLOWLIST_EMAILS` | Comma-separated emails | empty set                      |

### `VITE_HOSTED_ACCESS_MODE`

- **`invite`** — only emails in the allowlist may request a magic link or enter the app.
- **`open`** — allowlist is ignored; any email can use hosted auth (useful for staging).

If unset and Supabase hosted auth is configured (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`), mode defaults to **`invite`**.

### `VITE_HOSTED_ALLOWLIST_EMAILS`

Comma-separated list, case-insensitive, whitespace trimmed. Example:

```bash
VITE_HOSTED_ALLOWLIST_EMAILS=alice@company.com,bob@company.com
```

## Operator workflow

1. Confirm hosted auth env is set (`VITE_SUPABASE_*`).
2. Keep `VITE_HOSTED_ACCESS_MODE=invite` (or omit for default).
3. Add approved emails to `VITE_HOSTED_ALLOWLIST_EMAILS`.
4. Redeploy or restart the web dev server so Vite picks up env changes.
5. Ask the user to sign in again from `/welcome`.

To temporarily open dogfood to all emails, set `VITE_HOSTED_ACCESS_MODE=open`.

## Migration path

Today the allowlist is **env-based** for a fast tracer bullet. A later slice should move storage to **VPS control plane Postgres** (table or profile flag) and keep `decideHostedAccess` as the single decision function, swapping `readHostedAllowlistFromEnv()` for an API fetch. Supabase is interim only—see meta ADR-0001.

## Local development

```bash
cd apps/web
# .env.local example:
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
# VITE_HOSTED_ACCESS_MODE=invite
# VITE_HOSTED_ALLOWLIST_EMAILS=you@example.com

bun run dev
```

Run unit tests for the decision module:

```bash
cd apps/web && bun run test src/hosted/accessAllowlist.test.ts
```
