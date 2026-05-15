# Caqli AI Web Browser

**GitHub:** [github.com/saafir-coder/caqli-web-browser](https://github.com/saafir-coder/caqli-web-browser)  
**Workspace:** one product in the [Caqli meta repo](https://github.com/saafir-coder/caqli); not mixed with Cloud MVP or Desktop.

Browser-first agent dashboard (fork of [T3 Code](https://github.com/pingdotgg/t3code)). Run agents per project folder via Codex or Claude — self-host, open in a normal tab.

**Scope:** [`SCOPE.md`](SCOPE.md)

## Quick start

```bash
bun install
bun run dev
```

Open the URL printed for the web UI (e.g. `http://127.0.0.1:…/`).

## Monorepo layout

| Path | Role |
|------|------|
| `apps/web` | React UI — threads, composer, sidebar |
| `apps/server` | Node server — WebSocket, orchestration, Codex app-server |
| `apps/desktop` | Electron — **parked** (see `../caqli-desktop-parked/`) |
| `apps/marketing` | Upstream Astro site — optional, not part of Caqli v1 |
| `packages/contracts` | Shared schemas (WS protocol, types) |
| `packages/shared` | Shared runtime utilities |
| `packages/client-runtime` | Client orchestration helpers |
| `scripts/` | `dev-runner`, release/build scripts |

See [`AGENTS.md`](AGENTS.md) for package priorities and Codex integration notes.

## Parked / ignore for daily work

- `apps/desktop` — desktop packaging only
- `../caqli-cloud-legacy/` — old Supabase + Open Router MVP
- `../caqli-desktop-parked/` — fresher Electron rebrand copy

## Quality checks

```bash
bun fmt
bun lint
bun typecheck
bun run test
```
