## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**Tracer bullet:** **User** connects **Claude Code** on **Connect provider**, credentials through same vault pattern as **015**, runs an **Agent** turn on a **Thread** with **Thread provider** = Claude Code (`claudeAgent` runtime), decrypt only in execution memory. **Claude Code** no longer **Coming soon** in registry when this ships.

Demoable: connect Claude → one message → observable run success (file in **Code** optional but recommended).

## Acceptance criteria

- [ ] Claude connect flow end-to-end (UI → API → ciphertext → connected status on client).
- [ ] **Agent run** on Claude **Thread** uses decrypted creds server-side only.
- [ ] Tests mirror **015**/**016** patterns for `claudeAgent`.
- [ ] **Connect provider** shows Claude as active.

## Blocked by

- `issues/015-codex-connect-provider-end-to-end.md`
- `issues/016-dogfood-codex-agent-turn-file-in-code.md` (pattern reference)

## User stories addressed

- 7, 41

## Type

AFK
