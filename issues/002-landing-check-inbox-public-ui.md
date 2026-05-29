## Parent PRD

`issues/prd.md`

## What to build

**Public** **Landing** and **Check your inbox** surfaces that match **DESIGN-CENTRALIZED** / canonical **Stitch** (AnyCoder palette: true black base, gray chrome, **no** neon green CTAs; green **status-only**). Single email field + one primary CTA; optional subcopy that the link works for new or existing users. Submitting email triggers the real magic-link request from slice **001**.

## Acceptance criteria

- [ ] **Landing** and **Check your inbox** routes render per PRD visual direction and mobile/desktop layouts from canonical design references.
- [ ] Email submission calls hosted auth flow (slice **001**); **User** sees inbox confirmation state after submit.
- [ ] No password fields; no “sign up vs sign in” split required in v1.
- [ ] Layout/typography align with **DESIGN-CENTRALIZED** (Inter, tokens, flat depth).
- [ ] Focus order and labels are reasonable for keyboard users (baseline; full pass in slice **011**).

## Blocked by

- `issues/001-hosted-magic-link-auth.md`

## User stories addressed

- 1, 4
- Partial: 23, 24, 25, 26, 33, 41

## Type

AFK
