## Parent PRD

`issues/prd-hosted-cloud-agent.md`

## What to build

**HITL spike:** Produce `docs/cursor-provider-spike.md` covering Cursor Integrations / Cloud Agents API—credential type, scopes, whether agents can target a **Hosted workspace**, runtime adapter sketch, go/no-go, and estimate to extend `ProviderKind`. **No production Cursor connect** in this slice. **Connect provider** UI keeps **Cursor** as **Coming soon** until a follow-up implementation issue exists.

Requires human review of API access, legal/terms, and product call—not fully AFK.

## Acceptance criteria

- [ ] Spike doc committed under `docs/` and linked from PRD Further Notes.
- [ ] States recommended credential flow (API key vs OAuth) and dependencies for implementation.
- [ ] Explicit go/no-go recommendation for MVP vs post-MVP.
- [ ] **Connect provider** registry comments reference spike outcome.

## Blocked by

None - can start immediately.

## User stories addressed

- 42, 43

## Type

HITL
