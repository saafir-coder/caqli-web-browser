import * as FS from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { maskCaqliApiKey, readWorkspaceFile, readWorkspaceTree, resolveWorkspacePath } from "./caqliWorkspace";

const tempDirectories: string[] = [];

afterEach(() => {
  for (const directoryPath of tempDirectories.splice(0)) {
    FS.rmSync(directoryPath, { recursive: true, force: true });
  }
});

function makeWorkspace() {
  const directoryPath = FS.mkdtempSync(Path.join(OS.tmpdir(), "caqli-workspace-"));
  tempDirectories.push(directoryPath);
  return directoryPath;
}

describe("caqliWorkspace", () => {
  it("masks long api keys", () => {
    expect(maskCaqliApiKey("caqli_1234567890abcdef")).toBe("caqli_12...cdef");
  });

  it("blocks paths that escape the workspace", () => {
    const workspaceDir = makeWorkspace();
    expect(() => resolveWorkspacePath(workspaceDir, "../outside.txt")).toThrow(
      "Path escapes the selected workspace.",
    );
  });

  it("reads a small workspace tree and file preview", () => {
    const workspaceDir = makeWorkspace();
    FS.mkdirSync(Path.join(workspaceDir, "src"), { recursive: true });
    FS.writeFileSync(Path.join(workspaceDir, "src", "index.ts"), "console.log('hi')\n", "utf8");

    const tree = readWorkspaceTree(workspaceDir);
    expect(tree.some((entry) => entry.kind === "directory" && entry.name === "src")).toBe(true);

    expect(readWorkspaceFile(workspaceDir, "src/index.ts")).toContain("console.log");
  });
});
