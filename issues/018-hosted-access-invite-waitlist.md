## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**Access control** for hosted product: **dogfood** = invite-only allowlist (email, code, or operator flag); **public v1** = **Landing** waitlist capture + operator approval into magic-link access. Block sign-in or post-auth app entry when not approved. Open self-serve signup is out of scope until ops-ready.

## Acceptance criteria

- [ ] Non-invited email cannot complete hosted product entry during dogfood (clear messaging).
- [ ] Operator can add/remove allowlist entries (script, admin route, or Supabase flag—document chosen approach).
- [ ] Waitlist submission stores email; approved users can sign in; unapproved see honest state.
- [ ] Access checks enforced server-side, not UI-only.
- [ ] Unit tests for allowlist/waitlist decision module.

## Blocked by

- `issues/001-hosted-magic-link-auth.md`
- `issues/002-landing-check-inbox-public-ui.md` (waitlist UI)

## User stories addressed

- 31, 32, 33, 34, 60

## Type

AFK
