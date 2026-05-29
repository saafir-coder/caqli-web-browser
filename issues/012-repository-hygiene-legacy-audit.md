## Parent PRD

`issues/prd.md`

## What to build

**Repository hygiene before slice 001:** Separate **this** product (`caqli-web-browser`) from **old** Caqli work, remove **non-functional stub** tree(s), ensure **generated** artifacts aren’t mistaken for source, and document **where** legacy Supabase/OpenRouter code actually lives. **No** deletion of secrets, `.env` templates required for real services, or working `apps/*` / `packages/*` code without replacement.

## Acceptance criteria

- [ ] **Inventory doc** (this issue + team notes): confirm **legacy MVP** with Supabase/OpenRouter is **`../caqli-cloud-legacy/`** (per `README.md` / `SCOPE.md`), **not** the active T3 stack in `apps/web` + `apps/server`.
- [ ] **Code scan:** `apps/` and `packages/` contain **no** hard dependency on Supabase/OpenRouter for the current agent path (Codex/server model); any future Supabase is **new** work for slice **001**, not “leftover config.”
- [ ] **Remove or justify `legacy/cloud-mvp/`:** today it is an **empty** directory scaffold (no source files under `app/api/...`). Either delete the tree or replace with a one-line `README.md` explaining “do not use; see caqli-cloud-legacy.”
- [ ] **`graphify-out/`:** if outputs are tool-generated, add to **this** repo’s `.gitignore` (or delete local outputs); ensure CI/docs don’t require committing graph artifacts.
- [ ] **Large/untracked design caches** (e.g. Stitch HTML export cache): either gitignore pattern agreed with team or move out of working tree; avoid mixing huge exports with day-to-day implementation.
- [ ] **Parked apps:** `apps/desktop` remains **out of v1** per `README.md`; no requirement to delete, but **document** in one place that hosted v1 work ignores **desktop** unless explicitly reopening.
- [ ] **vscode file icons:** entries for `supabase` folder names in icon manifests are **cosmetic** (not runtime); leave unless cleaning upstream asset sync—if removed, run icon sync only with intent.

## Blocked by

None - **should complete before or in parallel with** `issues/001-hosted-magic-link-auth.md`.

## User stories addressed

N/A (engineering hygiene). Supports PRD **Problem Statement** (clear baseline before implementation) and **Further Notes** (no confusion with other products).

## Type

AFK

## Findings snapshot (2026-05-15 audit)

- **Supabase / OpenRouter strings** in this repo: mainly **docs** (`CONTEXT.md`, `issues/prd.md`), **README** pointer to sibling legacy, and **cosmetic** `vscode-icons-manifest.json` folder-type icons—not app dependencies in `apps/web` / `apps/server` `package.json`.
- **Actual old stack:** `SCOPE.md` → `../caqli-cloud-legacy/mvp/`; clean that **repo** separately if retiring code there.
