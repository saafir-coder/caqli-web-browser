import { describe, expect, it } from "vitest";

import { mapWorkingTreeFiles } from "./mapWorkingTreeFiles";

describe("mapWorkingTreeFiles", () => {
  it("maps git working tree entries to turn diff file changes", () => {
    expect(
      mapWorkingTreeFiles([
        { path: "src/a.ts", insertions: 3, deletions: 1 },
        { path: "README.md", insertions: 0, deletions: 2 },
      ]),
    ).toEqual([
      { path: "src/a.ts", additions: 3, deletions: 1 },
      { path: "README.md", additions: 0, deletions: 2 },
    ]);
  });
});
