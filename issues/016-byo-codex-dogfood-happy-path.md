## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**BYO outbound proxy** for **Codex**: on **Agent run** start, resolve **Thread provider**, load/decrypt **Provider credentials** in server memory only, inject into existing Codex adapter/provider manager. Deliver **dogfood happy path**: invite-approved **User** → **Project** → **Connect provider** (**Codex**) → one agent message → file change visible in **Code** tab on **Hosted pool**.

## Acceptance criteria

- [ ] **Agent run** without stored credentials for thread's provider is rejected with actionable client error (or routes to connect).
- [ ] Successful turn uses user's **Codex** subscription (document how billing is verified in dogfood notes).
- [ ] File written by agent appears in **Code** surface for the active **Project** (same **Hosted workspace**).
- [ ] Documented manual dogfood checklist in `docs/` or issue comment matches: magic link → project → connect Codex → message → file in Code.
- [ ] Works when **Client** is mobile viewport (smoke).

## Blocked by

- `issues/013-provider-credential-vault.md`
- `issues/014-hosted-pool-coordinator.md`
- `issues/015-connect-provider-onboarding-ui.md`
- `issues/005-app-shell-sidebar-projects-threads.md`
- `issues/006-chat-empty-chips-composer.md`
- `issues/007-code-surface-tree-editor.md`
- `issues/018-hosted-access-invite-waitlist.md` (invite gate for dogfood)

## User stories addressed

- 1, 6, 28, 40, 59

## Type

AFK
