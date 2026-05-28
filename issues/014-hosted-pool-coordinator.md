## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**Hosted pool coordinator**: map each **Project** to an isolated **Hosted workspace** path on Caqli-operated **Hosted pool** (shared T3 **Execution environments**). Idempotent provision on **Project** create; health/readiness signal for **Client** (“System: Connected” when pool route is reachable). Align **1:1 Project ↔ Environment** with workspace `cwd` used by provider sessions.

## Acceptance criteria

- [ ] Creating a **Project** provisions (or assigns) a workspace location on the pool; repeat calls are idempotent.
- [ ] **Agent runs** use the project's workspace path as `cwd` (or equivalent) on the pool server.
- [ ] Provision failures return actionable errors to onboarding (retry/clear state).
- [ ] Pool assignment is scoped per **User** account (no cross-tenant paths).
- [ ] Integration test: new project yields stable workspace marker usable by a test **Agent run** stub.

## Blocked by

- `issues/003-first-project-onboarding-provision.md` (partial—extend provisioning hook)
- `issues/001-hosted-magic-link-auth.md`

## User stories addressed

- 2, 3, 25, 28, 44, 47, 48

## Type

AFK
