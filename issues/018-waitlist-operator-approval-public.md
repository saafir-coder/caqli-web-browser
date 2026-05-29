## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**Tracer bullet (public v1 cohorts):** **Landing** captures waitlist email (no account yet); **operator** approves cohort; approved emails can complete magic-link **Sign-in**; unapproved see honest state. Reuses allowlist machinery from **013** where possible. **Open signup** for everyone remains out of scope.

Demoable: submit waitlist → operator approves → same email succeeds on `/welcome`; unapproved email still blocked.

## Acceptance criteria

- [ ] Waitlist submission persists email + status (pending / approved / denied).
- [ ] **Operator** can approve or revoke (script, admin UI, or Supabase—document choice).
- [ ] Approved waitlist email passes access gate; pending/denied cannot enter app (server-enforced).
- [ ] **Landing** UX distinguishes waitlist vs sign-in copy per PRD **002**.
- [ ] Unit tests for waitlist + approval decision module.

## Blocked by

- `issues/013-invite-only-access-gate-dogfood.md`
- `issues/002-landing-check-inbox-public-ui.md`

## User stories addressed

- 33, 34

## Type

AFK
