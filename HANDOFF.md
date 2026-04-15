# Caqli Handoff

Canonical repo: `caqli-ai`

Branch: `feature/caqli-desktop-v1`

## Current State

- `caqli-ai` is now the canonical repo for the product.
- The old standalone desktop repo was imported into `caqli-ai/desktop` as a subtree.
- Web changes and desktop changes are both now meant to continue from this repo.

## What Is Already Done

- Implemented the desktop workspace flow inside `desktop/`:
  - secure `caqli_*` key storage
  - workspace folder picker
  - file tree + file preview
  - model selection
  - local tool-backed coding agent
  - Claude credit gating
- Updated the web app so `/api/credits` accepts bearer `caqli_*` keys for desktop.
- Added desktop entry points in the web app.
- Added a dedicated `/desktop` setup page instead of linking users to a dead GitHub releases page.
- Fixed desktop bootstrapping so `bun run dev:desktop` auto-downloads Electron if missing.

## Verified

- Web app:
  - `npm run lint` passed earlier before the latest small UI edits
  - `npx next build --webpack` passed earlier
  - local `npm run dev` worked
- Desktop:
  - typecheck/build/test passed earlier before import
  - after the latest fix, `bun run dev:desktop` was reproduced and verified locally by Codex
  - confirmed during dev:
    - Vite shell on `http://127.0.0.1:5733`
    - backend on `http://127.0.0.1:13773`
    - Electron process launched successfully

## Uncommitted Changes Right Now

- Product changes:
  - `app/page.tsx`
  - `app/dashboard/page.tsx`
  - `app/desktop/page.tsx`
  - `desktop/apps/desktop/scripts/ensure-electron.mjs`
  - `desktop/apps/desktop/package.json`
  - `desktop/package.json`
- Lockfiles changed from local installs:
  - `package-lock.json`
  - `desktop/bun.lock`
- Pre-existing user-owned local edit:
  - `CHANGELOG.md`

## Why Desktop Was Failing

- The UI and backend were fine.
- The failure was the Electron runtime binary was not present.
- Bun had installed the Electron package metadata, but the actual runtime path file was missing.
- Fix added:
  - `desktop/apps/desktop/scripts/ensure-electron.mjs`
  - desktop start/dev scripts now run this bootstrap first

## What The Next Agent Should Do

1. Review and commit the current uncommitted changes in `caqli-ai`.
2. Decide whether `CHANGELOG.md` should stay out of the feature commit because it predates this work.
3. Update CI in the canonical repo so it validates both:
   - root web app
   - imported desktop app under `desktop/`
4. Replace remaining upstream `T3 Code` branding in the desktop side as needed.
5. If desired, package actual desktop release artifacts and then re-enable real download links.

## Useful Commands

Root web app:

```bash
cd "/Users/abdillahi/dev/Caqli Ai/caqli-ai"
npm install
npm run dev
```

Desktop app:

```bash
cd "/Users/abdillahi/dev/Caqli Ai/caqli-ai/desktop"
bun install
bun run dev:desktop
```

## Notes

- Root web app uses `npm`.
- Desktop monorepo uses `bun`.
- The old standalone `caqli-desktop` repo still exists locally only as a safety copy and is not the canonical place to continue work.
