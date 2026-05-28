## Parent PRD

`issues/prd.md`

## What to build

When an authenticated **User** has **zero Projects**, show a single **Name your first project** screen (suggested default, **Enter** to accept). On success, create **Project** + **Thread** (or equivalent) and provision **Hosted workspace** **1:1** with internal **Environment** per **CONTEXT.md**. Surface **honest loading** and **actionable** errors if provisioning fails.

## Acceptance criteria

- [ ] Authenticated **User** with no projects is routed to onboarding; **User** with projects does not see this screen (handled with slice **004** routing as needed).
- [ ] Submitting a name creates **Project** (and backing **Environment**/workspace) and leaves **User** ready to enter the app shell with a first thread.
- [ ] **1:1 Project ↔ Environment** invariant holds for new projects.
- [ ] Slow provisioning shows non-deceptive progress/disabled state; failures allow retry or clear next step.
- [ ] Data is **scoped** to the authenticated account.

## Blocked by

- `issues/001-hosted-magic-link-auth.md`

## User stories addressed

- 6, 7
- Partial: 42

## Type

AFK
