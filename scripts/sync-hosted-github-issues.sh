#!/usr/bin/env bash
# Sync local issues/013–020 + epic to GitHub mirror issues #1–#9.
# Run from products/caqli-web-browser with gh authenticated.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH="${1:-$(git -C "$ROOT" branch --show-current)}"
REPO="saafir-coder/caqli-web-browser"

header() {
  local file="$1"
  cat <<EOF
**Source of truth:** [\`${file}\`](https://github.com/${REPO}/blob/${BRANCH}/${file})
**Branch:** \`${BRANCH}\`
**Workflow:** [Caqli delivery workflow](https://github.com/saafir-coder/caqli/blob/main/.cursor/skills/caqli-delivery-workflow/SKILL.md)
**Index:** [\`issues/README-hosted-epic.md\`](https://github.com/${REPO}/blob/${BRANCH}/issues/README-hosted-epic.md)

---

EOF
}

sync_issue() {
  local gh_num="$1"
  local title="$2"
  local file="$3"
  local body_file
  body_file="$(mktemp)"
  header "$file" >"$body_file"
  cat "$ROOT/$file" >>"$body_file"
  gh issue edit "$gh_num" --repo "$REPO" --title "$title" --body-file "$body_file"
  rm -f "$body_file"
  echo "Updated #${gh_num}: ${title}"
}

cd "$ROOT"

sync_issue 1 "PRD: Hosted cloud agent (BYO, hosted pool, dogfood)" "issues/README-hosted-epic.md"
sync_issue 2 "013: Invite-only access gate (dogfood)" "issues/013-invite-only-access-gate-dogfood.md"
sync_issue 3 "014: Project provisions hosted pool workspace" "issues/014-project-provisions-hosted-pool-workspace.md"
sync_issue 4 "015: Codex connect provider (end-to-end)" "issues/015-codex-connect-provider-end-to-end.md"
sync_issue 5 "016: Dogfood — Codex turn + file in Code" "issues/016-dogfood-codex-agent-turn-file-in-code.md"
sync_issue 6 "017: Thread provider and concurrency gate" "issues/017-thread-provider-and-concurrency-gate.md"
sync_issue 7 "018: Waitlist and operator approval (public)" "issues/018-waitlist-operator-approval-public.md"
sync_issue 8 "019: Cursor provider spike (HITL)" "issues/019-cursor-provider-spike.md"
sync_issue 9 "020: Claude Code connect (end-to-end)" "issues/020-claude-code-connect-end-to-end.md"

echo "Done. Epic #1 body is README index; open PRD at issues/prd-hosted-cloud-agent.md"
