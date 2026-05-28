## Parent PRD

`issues/prd.md`

## What to build

**Free-tier daily cap**: **server-enforced** restriction on **new agent turns**; **soft block** UX—**User** can still read **Chat** history and browse **Code**; composer/banner communicates limit and reset semantics at a **simple** level (exact numbers per ops decision). Client reflects server decisions.

## Acceptance criteria

- [ ] When cap reached, **new** agent turns are rejected with stable, testable server behavior.
- [ ] **User** can still navigate, read history, and use **Code** read paths per PRD.
- [ ] UI shows clear messaging on composer and/or banner; upgrade/wait copy honest for v1.
- [ ] Automated tests cover **usage gate** mapping (per PRD Testing Decisions).
- [ ] No hard lockout that prevents read-only access.

## Blocked by

- `issues/001-hosted-magic-link-auth.md`
- `issues/005-app-shell-sidebar-projects-threads.md`

## User stories addressed

- 21, 22, 44

## Type

AFK
