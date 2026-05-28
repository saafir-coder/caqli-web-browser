## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

Wire **Claude Code** (`claudeAgent` runtime) through the same **Provider credential vault** and **BYO outbound proxy** pattern as **Codex**. Enable connect on **Connect provider** screen; mark **Claude Code** active in **Agent provider registry**.

## Acceptance criteria

- [ ] **User** can connect Claude credentials via vault; **Client** sees connected status only.
- [ ] **Thread** with **Thread provider** = Claude Code runs **Agent** using decrypted creds in execution memory only.
- [ ] Provider marked active in registry (no longer **Coming soon** for Claude).
- [ ] Tests mirror **Codex** vault/proxy patterns for `claudeAgent`.

## Blocked by

- `issues/013-provider-credential-vault.md`
- `issues/016-byo-codex-dogfood-happy-path.md` (pattern reference)

## User stories addressed

- 7, 41

## Type

AFK
