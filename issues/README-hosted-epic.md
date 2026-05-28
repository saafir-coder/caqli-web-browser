# Hosted cloud agent — issue index

**Parent PRD:** [`prd-hosted-cloud-agent.md`](./prd-hosted-cloud-agent.md)  
**Architecture (meta repo):** `caqli` → `docs/adr/0001-hosted-agent-architecture.md`  
**Shell PRD (prerequisite):** [`prd.md`](./prd.md) → issues `001`–`012`  
**Branch:** `feature/hosted-cloud-agent`  
**Workflow:** meta repo [`.cursor/skills/caqli-delivery-workflow/SKILL.md`](../../../.cursor/skills/caqli-delivery-workflow/SKILL.md)

Slices **013–020** follow **vertical tracer bullets** ([prd-to-issues](https://github.com/saafir-coder/caqli/blob/main/.cursor/skills/prd-to-issues/SKILL.md) skill): each is demoable end-to-end, not a horizontal layer.

## GitHub mirror (optional)

Local files are the **source of truth**. GitHub issues on `saafir-coder/caqli-web-browser` mirror them for assignment and PR linking:

| Local file                                        | GitHub issue                                                     | Title                                         |
| ------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| (epic) PRD + this README                          | [#1](https://github.com/saafir-coder/caqli-web-browser/issues/1) | PRD: Hosted cloud agent                       |
| `013-invite-only-access-gate-dogfood.md`          | [#2](https://github.com/saafir-coder/caqli-web-browser/issues/2) | 013: Invite-only access gate (dogfood)        |
| `014-project-provisions-hosted-pool-workspace.md` | [#3](https://github.com/saafir-coder/caqli-web-browser/issues/3) | 014: Project provisions hosted pool workspace |
| `015-codex-connect-provider-end-to-end.md`        | [#4](https://github.com/saafir-coder/caqli-web-browser/issues/4) | 015: Codex connect provider (end-to-end)      |
| `016-dogfood-codex-agent-turn-file-in-code.md`    | [#5](https://github.com/saafir-coder/caqli-web-browser/issues/5) | 016: Dogfood — Codex turn + file in Code      |
| `017-thread-provider-and-concurrency-gate.md`     | [#6](https://github.com/saafir-coder/caqli-web-browser/issues/6) | 017: Thread provider and concurrency gate     |
| `018-waitlist-operator-approval-public.md`        | [#7](https://github.com/saafir-coder/caqli-web-browser/issues/7) | 018: Waitlist and operator approval (public)  |
| `019-cursor-provider-spike.md`                    | [#8](https://github.com/saafir-coder/caqli-web-browser/issues/8) | 019: Cursor provider spike (HITL)             |
| `020-claude-code-connect-end-to-end.md`           | [#9](https://github.com/saafir-coder/caqli-web-browser/issues/9) | 020: Claude Code connect (end-to-end)         |

After editing a local slice, sync the GitHub body:  
`./scripts/sync-hosted-github-issues.sh` (from product repo root).

## Implementation order (dogfood first)

| Order | Slice                                                                              | Depends on         |
| ----- | ---------------------------------------------------------------------------------- | ------------------ |
| 1     | [013 invite gate](./013-invite-only-access-gate-dogfood.md)                        | 001                |
| 2     | [014 pool on project create](./014-project-provisions-hosted-pool-workspace.md)    | 001, 003           |
| 3     | [015 Codex connect E2E](./015-codex-connect-provider-end-to-end.md)                | 013, 014, 002      |
| 4     | [016 dogfood happy path](./016-dogfood-codex-agent-turn-file-in-code.md)           | 015, 005–007       |
| 5     | [017 thread provider + concurrency](./017-thread-provider-and-concurrency-gate.md) | 016                |
| —     | [019 Cursor spike](./019-cursor-provider-spike.md)                                 | — (HITL, parallel) |
| 6     | [018 waitlist (public cohorts)](./018-waitlist-operator-approval-public.md)        | 013, 002           |
| 7     | [020 Claude connect E2E](./020-claude-code-connect-end-to-end.md)                  | 015, 016           |

**Shell track (parallel):** complete `001`–`012` from [`prd.md`](./prd.md) on the same branch where possible.

## Dogfood definition of done

**016** acceptance + **013** invite gate. See PRD Further Notes.

## Agent prompt template

```text
Implement local slice issues/NNN-….md on branch feature/hosted-cloud-agent.
Read: that file + issues/prd-hosted-cloud-agent.md + CONTEXT.md.
Vertical slice: ship schema + API + UI + tests for this slice only.
Do not return provider secrets to the client.
Close GitHub mirror issue when PR merges (see README GitHub table).
```
