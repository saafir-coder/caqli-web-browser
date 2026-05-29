## Parent PRD

`issues/prd.md`

## What to build

**Code** surface: **file tree** + **editor** reflecting the **active Project**’s **Hosted workspace**—same workspace **Chat** uses. **Mobile**: reachable via shell nav (e.g. bottom nav); **desktop/tablet**: equivalent access without breaking layout. Ensures **Project** switch updates tree/editor context.

## Acceptance criteria

- [ ] **User** can open **Code** from the shell and see structure + file contents for the active project workspace.
- [ ] **Chat** and **Code** stay consistent for the selected **Project** (no divergent roots).
- [ ] **Mobile** keeps **Chat** and **Code** thumb-reachable per PRD.
- [ ] Read path works under **soft block** when implemented (slice **009**); no dependency to start file/browser features beyond listed criteria.

## Blocked by

- `issues/005-app-shell-sidebar-projects-threads.md`

## User stories addressed

- 16, 17, 39
- Partial: 21

## Type

AFK
