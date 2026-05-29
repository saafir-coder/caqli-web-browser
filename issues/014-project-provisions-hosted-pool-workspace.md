## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**Tracer bullet:** When a **User** creates their first (or next) **Project** through hosted onboarding (`issues/003-first-project-onboarding-provision.md`), the system **provisioned end-to-end** assigns an isolated **Hosted workspace** on the **Hosted pool** (shared T3 **Execution environment**), persists the mapping in **control plane**, and exposes readiness so the **Client** can show honest loading/errors. **1:1 Project ↔ Environment** / workspace path. Repeat create is **idempotent**.

Demoable alone: create project → persisted row + workspace marker → integration test or stub proves path exists for a future agent `cwd`.

## Acceptance criteria

- [ ] Submitting **Name your first project** (or API equivalent) creates **Project** + pool workspace assignment in one flow.
- [ ] Second provision call for same project does not duplicate or corrupt workspace.
- [ ] Provision failure surfaces actionable UX on onboarding (retry / support path).
- [ ] Assignment scoped to authenticated **User** (no cross-tenant paths).
- [ ] Integration test: new project yields stable workspace marker usable by server agent stub.

## Blocked by

- `issues/001-hosted-magic-link-auth.md`
- `issues/003-first-project-onboarding-provision.md` (extend—not replace—onboarding contract)

## User stories addressed

- 2, 3, 25, 44, 47, 48

## Type

AFK
