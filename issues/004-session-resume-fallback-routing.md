## Parent PRD

`issues/prd.md`

## What to build

**Session resume** for returning **Users**: after magic link (or refresh), land on **last active** **Project** and **Thread**. Implement the **fallback chain** from **CONTEXT.md** when IDs are missing or stale (e.g. thread deleted → most recent thread in project → new thread in project → first project ordering—finalize exact order in acceptance tests). **Deep links** should not strand an authenticated **User** on **Landing** inappropriately.

## Acceptance criteria

- [ ] Last **Project**/**Thread** selection is persisted per **User** and updated when they switch context (per PRD).
- [ ] Fallback when last **Thread** is missing follows the agreed ordered rules and never dead-ends.
- [ ] Returning **User** with ≥1 **Project** skips **003** onboarding.
- [ ] Authenticated navigation prefers **App** over public marketing routes per PRD.
- [ ] Automated tests cover fallback ordering for the **session resume controller** (per PRD Testing Decisions).

## Blocked by

- `issues/001-hosted-magic-link-auth.md`
- `issues/003-first-project-onboarding-provision.md`

## User stories addressed

- 8, 9, 10, 43

## Type

AFK
