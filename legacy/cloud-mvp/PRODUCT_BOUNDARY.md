# Product boundary inside `caqli-ai`

This git repository contains **two unrelated products**. Treat them separately.

## 1. Caqli Cloud (legacy MVP) — repo root

| Paths | Role |
|-------|------|
| `app/`, `components/`, `lib/`, `supabase/`, `middleware.ts` | Next.js API gateway + browser editor + Supabase credits |

**Workspace category:** [`../products/caqli-cloud-legacy/`](../products/caqli-cloud-legacy/)

**Do not extend this** when building Caqli AI Web Browser unless you deliberately add a small API bridge later.

## 2. Caqli AI Web Browser (+ desktop packaging) — `desktop/`

| Paths | Role |
|-------|------|
| `desktop/apps/web` | Agent dashboard UI (browser target) |
| `desktop/apps/server` | WebSocket server, Codex/Claude orchestration |
| `desktop/apps/desktop` | Electron — **parked** ([`../products/caqli-desktop-parked/`](../products/caqli-desktop-parked/)) |
| `desktop/packages/*` | Shared contracts |

**Workspace category:** [`../products/caqli-web-browser/`](../products/caqli-web-browser/)

## Active work

Today: **Web Browser only** — run `cd desktop && bun run dev`, ignore repo root `npm run dev` unless touching legacy API.
