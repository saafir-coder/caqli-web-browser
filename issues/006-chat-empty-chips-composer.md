## Parent PRD

`issues/prd.md`

## What to build

**Chat** as default surface: **empty Thread** shows **“What do you want to build?”** and **three** starter chips with **v1 copy** from **CONTEXT.md** / PRD. **Composer** uses **circular dark send** (not green pill). **Chips** only on appropriate empty state, not noisy on active threads. **Bubbles/timestamps** follow PRD visual direction where applicable.

## Acceptance criteria

- [ ] Default shell tab/surface is **Chat** after entering **App** (per PRD).
- [ ] Empty thread shows placeholder + chips: **Add a README for this project**, **Fix the failing test**, **Suggest a project structure**; chip tap starts a turn/message per product rules.
- [ ] Send control matches canonical composer affordance (dark circular send).
- [ ] Starter chips hidden when thread is not in empty state (per story 37).
- [ ] Chat bubble/timestamp styling consistent with AnyCoder-aligned rules (partial coverage acceptable if tracked).

## Blocked by

- `issues/005-app-shell-sidebar-projects-threads.md`

## User stories addressed

- 14, 15, 37, 38, 26
- Partial: 23, 24, 25

## Type

AFK
