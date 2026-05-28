## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**Provider credential vault**: server-side module to accept **Connect provider** input, envelope-encrypt with a master key (env/KMS), persist ciphertext in **control plane** (Postgres/Supabase), and expose only connection status to the **Client**—never plaintext after connect. Evolve **contracts** for provider kind enums and connect/status events (schema-only package).

## Acceptance criteria

- [ ] Storing a credential writes ciphertext + metadata (provider kind, key version, timestamps); no plaintext column.
- [ ] Client-facing APIs return connected/disconnected (and provider kind), not secret material.
- [ ] Decrypt API exists only for **Execution environment** / server paths that start **Agent runs** (not callable from browser).
- [ ] Connect/disconnect/rotate flows are audited without logging secret values.
- [ ] Unit tests: round-trip encrypt/decrypt; API never leaks plaintext; wrong user cannot read another user's credentials (integration with auth scoping).

## Blocked by

- `issues/001-hosted-magic-link-auth.md` (authenticated **User** scope)

## User stories addressed

- 14, 15, 53, 54, 55

## Type

AFK
