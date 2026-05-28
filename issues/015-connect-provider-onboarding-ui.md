## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**Connect provider** onboarding route after first **Project** creation (before full **App** **Chat**): mobile-first UI listing **Cursor**, **Codex**, and **Claude Code** via **Agent provider registry**. Active providers offer connect; inactive show honest **Coming soon**. Copy states model usage bills to the user's provider account. Port layout/tokens from meta Stitch reference and `design/DESIGN-CENTRALIZED.md`. Just-in-time: if **User** reaches **Chat** without credentials, first **Send** routes here.

## Acceptance criteria

- [ ] First-time path after name-project includes **Connect provider** unless credentials already exist for at least one provider.
- [ ] All three **Agent providers** visible; unwired providers are not fake-connectable.
- [ ] Successful **Codex** connect (when slice **016** ready) routes into **App** **Chat**.
- [ ] Accessible labels, focus order, and keyboard path on connect forms (coordinate with **011**).
- [ ] **Client** never stores provider secrets in localStorage after submit.

## Blocked by

- `issues/003-first-project-onboarding-provision.md`
- `issues/013-provider-credential-vault.md` (for Codex connect submit)
- `issues/002-landing-check-inbox-public-ui.md` (shell routing)

## User stories addressed

- 8, 9, 10, 11, 12, 13, 45, 46

## Type

AFK
