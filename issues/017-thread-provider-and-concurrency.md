## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**Default agent provider** (account setting) and **Thread provider** (fixed per **Thread** at creation). Reject **Thread provider** changes mid-thread in MVP. **Agent run concurrency gate**: dogfood = one active **Agent run** per **Project**; prepare configurable cap (e.g. 2) before public launch.

## Acceptance criteria

- [ ] New **Threads** inherit **Default agent provider** unless user selects another at creation.
- [ ] **Thread provider** stored and used for all turns in that **Thread**.
- [ ] Attempt to start a second concurrent **Agent run** on the same **Project** fails with clear error while first is active (dogfood).
- [ ] Unit tests for policy module and concurrency gate without UI coupling.
- [ ] Contracts/events updated if provider selection is exposed over WebSocket.

## Blocked by

- `issues/016-byo-codex-dogfood-happy-path.md` (partial—can start policy module earlier)

## User stories addressed

- 20, 21, 22, 23, 24

## Type

AFK
