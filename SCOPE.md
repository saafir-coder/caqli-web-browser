# Scope — Caqli AI Web Browser (today)

## In scope

- Browser UI for multi-agent, per-directory workflows (T3 Code model)
- Local or self-hosted **server** (`apps/server`) reachable from the browser
- Codex + Claude provider integration already in the fork
- Branding as **Caqli AI** in the web shell

## Out of scope (parked elsewhere)

- Electron builds (`apps/desktop` in-repo; active copy in `../caqli-desktop-parked/`)
- Legacy Next.js MVP: `../caqli-cloud-legacy/mvp/`
- Desktop-only IPC: `desktopBridge`, `sendCaqliAgentMessage`

## Next steps

1. Deploy web + server for browser-only use.
2. Optional: limited free API service (not merged into legacy MVP).

## Relationship to T3 Code

Forked T3 Code. This folder **is** the monorepo root (`apps/web`, `apps/server`, `packages/*`).
