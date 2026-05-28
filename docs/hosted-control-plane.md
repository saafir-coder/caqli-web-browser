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

## Client modules (transition)

- `apps/web/src/hosted/controlPlane/poolWorkspace.ts` — `provisionWorkspacePath`
- `apps/web/src/hosted/controlPlane/projects.ts` — `createHostedProject` (today: Supabase client; **migrate** to `POST /api/hosted/projects`)

Onboarding (`/onboarding`) should call the server API once VPS control plane is live.

## Local dogfood (optional, interim)

If still using Supabase for auth during migration, see previous Supabase CLI flow in git history. Prefer VPS + `VITE_API_URL` for new work.
