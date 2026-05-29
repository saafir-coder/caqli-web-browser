## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**Tracer bullet (dogfood definition of done):** On the **Hosted pool**, start one **Agent run** using stored **Codex** credentials (decrypt in **Execution environment** memory only, inject into existing provider manager), send one **User** message from **Chat**, agent writes a file in the project's **Hosted workspace**, file appears in **Code** tab. Document manual checklist under `docs/` (magic link → project → connect Codex → message → file in **Code**). Mobile viewport smoke.

This slice owns **BYO outbound proxy** for Codex—not a separate horizontal “proxy module” issue.

## Acceptance criteria

- [ ] **Agent run** without Codex credentials fails with actionable error or routes to connect.
- [ ] One successful turn uses user's BYO Codex path (note billing verification in dogfood doc).
- [ ] File created by agent is visible in **Code** for active **Project** (same workspace as **Chat**).
- [ ] `docs/` dogfood checklist matches implemented path.
- [ ] Works at mobile viewport width (smoke).

## Blocked by

- `issues/015-codex-connect-provider-end-to-end.md`
- `issues/005-app-shell-sidebar-projects-threads.md`
- `issues/006-chat-empty-chips-composer.md`
- `issues/007-code-surface-tree-editor.md`

## User stories addressed

- 1, 28, 40, 59

## Type

AFK
