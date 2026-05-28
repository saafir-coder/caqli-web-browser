# Hosted cloud agent — issue index

**Parent PRD:** [`prd-hosted-cloud-agent.md`](./prd-hosted-cloud-agent.md)  
**Architecture (meta repo):** `caqli` → `docs/adr/0001-hosted-agent-architecture.md`  
**Shell PRD (prerequisite UX):** [`prd.md`](./prd.md) → issues `001`–`012`  
**GitHub epic:** [#1](https://github.com/saafir-coder/caqli-web-browser/issues/1)

## Slices (implementation order)

| Slice | File | Depends on |
|-------|------|------------|
| 013 | [provider-credential-vault](./013-provider-credential-vault.md) | 001 |
| 014 | [hosted-pool-coordinator](./014-hosted-pool-coordinator.md) | 001, 003 |
| 018 | [hosted-access-invite-waitlist](./018-hosted-access-invite-waitlist.md) | 001, 002 |
| 015 | [connect-provider-onboarding-ui](./015-connect-provider-onboarding-ui.md) | 003, 013 |
| 016 | [byo-codex-dogfood-happy-path](./016-byo-codex-dogfood-happy-path.md) | 013–015, 005–007, 018 |
| 017 | [thread-provider-and-concurrency](./017-thread-provider-and-concurrency.md) | 016 (partial) |
| 019 | [cursor-provider-spike](./019-cursor-provider-spike.md) | — |
| 020 | [claude-code-provider-connect](./020-claude-code-provider-connect.md) | 013, 016 |

## Dogfood definition of done

Issue **016** acceptance + invite gate **018**.

## Agent prompt template

```text
Implement GitHub issue #N for saafir-coder/caqli-web-browser.
Branch: feature/hosted-cloud-agent
Read: issues/00N-….md and issues/prd-hosted-cloud-agent.md
Do not return provider secrets to the client.
```
