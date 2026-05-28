## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**Tracer bullet:** **User** can set **Default agent provider** (account), choose **Thread provider** at **Thread** creation (fixed for thread lifetime), and server enforces **one active Agent run per Project** during dogfood—with clear error if a second starts. Persist policy in **control plane**; expose selection in UI where shell PRD expects; update **contracts**/WebSocket events if needed.

Demoable: create two threads with different providers (Codex only until **020**); second concurrent run on same project blocked.

## Acceptance criteria

- [ ] New **Threads** default to account **Default agent provider** unless user picks another at creation.
- [ ] **Thread provider** immutable mid-thread in MVP (reject or hide swap).
- [ ] Second concurrent **Agent run** on same **Project** rejected with clear client-visible error.
- [ ] Unit tests for policy + concurrency modules without UI coupling.
- [ ] End-to-end smoke: policy stored and honored on real **Agent run** start.

## Blocked by

- `issues/016-dogfood-codex-agent-turn-file-in-code.md`

## User stories addressed

- 20, 21, 22, 23, 24

## Type

AFK
