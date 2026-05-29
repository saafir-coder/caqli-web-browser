import { describe, expect, it } from "vitest";

import { resolveThreadChangesView } from "./threadChangesViewModel";

describe("resolveThreadChangesView", () => {
  it("prefers turn checkpoints when summaries exist", () => {
    const view = resolveThreadChangesView({
      isGitRepo: true,
      turnDiffSummaries: [{ turnId: "t1" as never, files: [], completedAt: "2026-01-01" }],
      workingTreeFiles: [{ path: "a.ts", additions: 1, deletions: 0 }],
    });
    expect(view.mode).toBe("turnCheckpoints");
  });

  it("falls back to working tree when there are no turn summaries", () => {
    const view = resolveThreadChangesView({
      isGitRepo: true,
      turnDiffSummaries: [],
      workingTreeFiles: [{ path: "a.ts", additions: 0, deletions: 0 }],
    });
    expect(view.mode).toBe("workingTree");
    expect(view.changedFileCount).toBe(1);
  });
});
