## Parent PRD

`issues/prd.md`

## What to build

End-to-end **hosted magic-link authentication**: a **User** can start sign-in with email, complete the link, and hold a **persisted session** suitable for **Hosted tier** multi-tenant use. **Pair** remains available for **dev/local** builds but is **not** the production path. Align with **Implementation Decisions** (auth, tenancy gate) and **CONTEXT.md** (**Sign-in**, **Pair**, **Hosted tier**).

## Acceptance criteria

- [ ] **User** can request a magic link with email (single path for new/returning).
- [ ] Completing the link establishes a **session** that survives refresh within expected provider rules.
- [ ] Authenticated **User** identity is available to the app/server in a way scoped for **Hosted tier** (no cross-account bleed).
- [ ] Production configuration does **not** surface **Pair** as a primary auth/onboarding path; **Pair** remains usable in dev/local as agreed.
- [ ] Basic failure cases (expired/invalid link) show **actionable** messaging, not a blank state.

## Blocked by

None - can start immediately.

## User stories addressed

- 2, 3, 5, 28, 29, 30, 32
- Partial: 31, 36, 43

## Type

AFK
