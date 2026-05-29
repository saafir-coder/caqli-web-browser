import type { GitStatusResult } from "@t3tools/contracts";

import type { TurnDiffFileChange } from "../../types";

export function mapWorkingTreeFiles(
  files: GitStatusResult["workingTree"]["files"],
): TurnDiffFileChange[] {
  return files.map((file) => ({
    path: file.path,
    additions: file.insertions,
    deletions: file.deletions,
  }));
}
