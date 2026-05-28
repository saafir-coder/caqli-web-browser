## Parent PRD

`issues/prd.md`

## What to build

**Accessibility baseline** across hosted funnel and shell: focus order, labels, and keyboard operability for **Landing**, **Check your inbox**, **Name your first project**, and primary **App** chrome (sidebar/drawer, primary nav). Fix obvious WCAG gaps discovered in review; document known follow-ups if any remain.

## Acceptance criteria

- [ ] **Landing** + **inbox** + **onboarding** routes: focus visible, logical tab order, inputs/buttons labeled.
- [ ] **App** shell: drawer/sidebar open/close and thread selection operable via keyboard where applicable.
- [ ] No critical traps (focus lock without escape) in modals/drawers introduced by these flows.
- [ ] Short note in PR/issue or internal doc listing any deferred a11y items with rationale.

## Blocked by

- `issues/002-landing-check-inbox-public-ui.md`
- `issues/003-first-project-onboarding-provision.md`
- `issues/005-app-shell-sidebar-projects-threads.md`

## User stories addressed

- 33

## Type

AFK
