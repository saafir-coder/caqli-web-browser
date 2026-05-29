# Hosted control plane

Persists **Project** ↔ **Hosted workspace** mappings and hosted metadata. **Production target:** Postgres on **Caqli VPS**, accessed only through **control plane APIs** on `apps/server`—not from the browser.

Infrastructure overview: meta repo [docs/hosted-vps-infrastructure.md](../../../docs/hosted-vps-infrastructure.md).

## Schema

| Column           | Description                                    |
| ---------------- | ---------------------------------------------- |
| `id`             | Project UUID                                   |
| `user_id`        | Account id (control plane `users.id`)          |
| `name`           | User-visible project name                      |
| `workspace_path` | Object-store prefix `pool/{userId}/{projectId}` |
| `created_at`     | Row timestamp                                  |

Tenancy: API must scope all queries by authenticated `user_id` (replace interim Supabase RLS).

## Migrations

**Target:** SQL migrations applied to VPS Postgres (e.g. `migrations/` on server).

**Interim:** `supabase/migrations/20260528120000_hosted_control_plane.sql` mirrors the same tables for local/dogfood Supabase—do not treat as production topology.

## Server API (VPS control plane)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Liveness |
| POST | `/api/hosted/access/check` | Invite allowlist (server-enforced) |
| POST | `/api/hosted/auth/magic-link` | Issue magic link |
| GET | `/api/hosted/auth/callback?token=…` | Complete sign-in, set session cookie |
| GET | `/api/hosted/session` | Hosted user session |
| GET/POST | `/api/hosted/projects` | List / create projects |

## Client modules

- `apps/web/src/hosted/apiClient.ts` — control plane HTTP client
- `apps/web/src/hosted/controlPlane/projects.ts` — uses API when `VITE_API_URL` / `VITE_HTTP_URL` is set (no Supabase); Supabase remains interim fallback

Onboarding (`/onboarding`) calls `POST /api/hosted/projects` when the control plane is configured.

## Local dogfood (optional, interim)

If still using Supabase for auth during migration, see previous Supabase CLI flow in git history. Prefer VPS + `VITE_API_URL` for new work.
