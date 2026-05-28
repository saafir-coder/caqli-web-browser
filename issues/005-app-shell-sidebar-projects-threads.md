## Parent PRD

`issues/prd.md`

## What to build

**App shell** with **Sidebar**: **Projects** as collapsible sections, **Threads** nested; **+ New project** at top; **+ New thread** per project header; **first Project** auto-expanded for new users. **Phone**: sidebar as **drawer** with clear affordances; **tablet/desktop**: persistent sidebar where appropriate. Switching **Project** updates thread list and active workspace context. **Pair** hidden in **production** builds for end users.

## Acceptance criteria

- [ ] **Sidebar** matches **CONTEXT.md** layout rules and PRD user stories for structure.
- [ ] **User** can create additional projects/threads from the sidebar (wired to hosted persistence).
- [ ] **Mobile** drawer behavior is usable; **desktop/tablet** shows persistent sidebar pattern.
- [ ] Active **Project** change updates downstream surfaces’ workspace context (chat/code).
- [ ] Production UX does not promote **Pair**; dev/local behavior unchanged per PRD.

## Blocked by

- `issues/001-hosted-magic-link-auth.md`
- `issues/003-first-project-onboarding-provision.md`

## User stories addressed

- 11, 12, 13, 18, 19, 27, 29, 30
- Partial: 34

## Type

AFK
