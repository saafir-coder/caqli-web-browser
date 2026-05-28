## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**Tracer bullet:** After first **Project**, **User** completes **Connect provider** for **Codex** only—full vertical slice: onboarding route (mobile-first, design tokens), submit credential, **envelope-encrypt** and store in Postgres/Supabase, **Client** sees connected/disconnected only, **contracts** updated for provider status enums. **Cursor** and **Claude Code** rows visible with honest **Coming soon** (not fake-connectable). Copy: model usage bills to user's provider account.

Includes minimal **vault** and **registry** needed for Codex—no separate “vault-only” issue. If **User** skips to **Chat** without creds, first **Send** routes here.

## Acceptance criteria

- [ ] Allowlisted **User** with project lands on **Connect provider** before full **Chat** unless Codex already connected.
- [ ] Codex connect: form → API → ciphertext persisted → UI shows connected; browser never retains secret after submit.
- [ ] Cursor and Claude Code shown; unwired providers cannot submit secrets.
- [ ] Successful Codex connect routes into **App** **Chat** (default surface).
- [ ] Unit/integration tests: no plaintext in client API responses; wrong user cannot read another user's credentials.

## Blocked by

- `issues/013-invite-only-access-gate-dogfood.md`
- `issues/014-project-provisions-hosted-pool-workspace.md`
- `issues/002-landing-check-inbox-public-ui.md` (routing parity)

## User stories addressed

- 6, 8, 9, 10, 11, 12, 13, 14, 15, 45, 46, 53, 54, 55

## Type

AFK
