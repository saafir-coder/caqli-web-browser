import type { TurnDiffFileChange, TurnDiffSummary } from "../types";

export type ThreadChangesMode = "workingTree" | "turnCheckpoints" | "empty" | "notGitRepo";

export interface ThreadChangesViewModel {
  readonly mode: ThreadChangesMode;
  readonly workingTreeFiles: ReadonlyArray<TurnDiffFileChange>;
  readonly turnDiffSummaries: ReadonlyArray<TurnDiffSummary>;
  readonly changedFileCount: number;
}

export function resolveThreadChangesView(input: {
  isGitRepo: boolean;
  turnDiffSummaries: ReadonlyArray<TurnDiffSummary>;
  workingTreeFiles: ReadonlyArray<TurnDiffFileChange>;
}): ThreadChangesViewModel {
  const { isGitRepo, turnDiffSummaries, workingTreeFiles } = input;

  if (!isGitRepo) {
    return {
      mode: "notGitRepo",
      workingTreeFiles,
      turnDiffSummaries,
      changedFileCount: 0,
    };
  }

  if (turnDiffSummaries.length > 0) {
    return {
      mode: "turnCheckpoints",
      workingTreeFiles,
      turnDiffSummaries,
      changedFileCount: workingTreeFiles.length,
    };
  }

  if (workingTreeFiles.length > 0) {
    return {
      mode: "workingTree",
      workingTreeFiles,
      turnDiffSummaries,
      changedFileCount: workingTreeFiles.length,
    };
  }

  return {
    mode: "empty",
    workingTreeFiles,
    turnDiffSummaries,
    changedFileCount: 0,
  };
}
