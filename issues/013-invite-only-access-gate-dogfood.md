## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**Tracer bullet (dogfood):** Only **operator-approved** emails can use the hosted product. End-to-end path: **User** enters email on `/welcome` (or landing) → **control plane** checks allowlist → if not approved, **clear messaging** and **no** magic link (or block after callback before app entry—pick one approach and document it). **Operator** can add/remove emails via script, admin route, or Supabase flag. Enforce on **server**, not UI-only.

Split from old horizontal “vault/pool/UI” issues; this slice is demoable alone: a blocked email never reaches onboarding.

## Acceptance criteria

- [ ] Non-allowlisted email cannot complete hosted entry during dogfood (actionable copy, no silent failure).
- [ ] Allowlisted email can proceed through existing magic-link flow (`issues/001-hosted-magic-link-auth.md`).
- [ ] Allowlist storage and check documented (table, profile flag, or env list + migration path).
- [ ] Server-side enforcement on auth callback and/or OTP request (not client-only).
- [ ] Unit tests for allowlist decision module (approved / denied / missing row).

## Blocked by

- `issues/001-hosted-magic-link-auth.md`

## User stories addressed

- 31, 32, 60

## Type

AFK
