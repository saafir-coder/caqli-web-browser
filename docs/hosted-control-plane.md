# Hosted control plane

Persists **Project** ↔ **Hosted workspace** mappings for the hosted tier (`public.hosted_projects`).

## Schema

| Column           | Description                                    |
| ---------------- | ---------------------------------------------- |
| `id`             | Project UUID (client-generated on create)      |
| `user_id`        | Supabase `auth.users.id`                       |
| `name`           | User-visible project name                      |
| `workspace_path` | Pool path `pool/{userId}/{projectId}` (unique) |
| `created_at`     | Row timestamp                                  |

Row Level Security: authenticated users can CRUD only rows where `auth.uid() = user_id`.

## Apply migrations

From the product repo root (`products/caqli-web-browser`):

```bash
# One-time: link to your Supabase project (or use local)
supabase link --project-ref <your-project-ref>

# Push migration
supabase db push
```

Migration file: `supabase/migrations/20260528120000_hosted_control_plane.sql`.

## Supabase local (optional)

```bash
supabase start
supabase db reset   # applies all migrations under supabase/migrations/
```

Point the web app at local Supabase in `apps/web/.env.local`:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key from supabase status>
```

Run the web app:

```bash
cd apps/web && bun run dev
```

## Client modules

- `apps/web/src/hosted/controlPlane/poolWorkspace.ts` — `provisionWorkspacePath`
- `apps/web/src/hosted/controlPlane/projects.ts` — `listHostedProjects`, `createHostedProject`
- Onboarding (`/onboarding`) calls `createHostedProject` and stores `caqli.hostedActiveProjectId`

If Supabase insert fails in **development**, the client logs a warning and queues the payload in `localStorage` (`caqli.hostedProjectPendingQueue`) so flows can be exercised without a live database.
