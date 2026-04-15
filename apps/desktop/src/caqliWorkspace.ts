import * as FS from "node:fs";
import * as Path from "node:path";

import type { CaqliDesktopWorkspaceEntry } from "@t3tools/contracts";

const IGNORED_DIRECTORY_NAMES = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);

const DEFAULT_MAX_DEPTH = 4;
const DEFAULT_MAX_ENTRIES_PER_DIRECTORY = 200;
const DEFAULT_MAX_FILE_CHARS = 50_000;

function normalizeWorkspaceRoot(workspaceDir: string): string {
  const trimmed = workspaceDir.trim();
  if (trimmed.length === 0) {
    throw new Error("Workspace path is required.");
  }
  return Path.resolve(trimmed);
}

function isPathInsideWorkspace(workspaceRoot: string, candidatePath: string): boolean {
  const relativePath = Path.relative(workspaceRoot, candidatePath);
  return relativePath !== ".." && !relativePath.startsWith(`..${Path.sep}`) && !Path.isAbsolute(relativePath);
}

export function resolveWorkspacePath(workspaceDir: string, targetPath: string): string {
  const workspaceRoot = normalizeWorkspaceRoot(workspaceDir);
  const resolvedPath = Path.resolve(
    workspaceRoot,
    targetPath.trim().length > 0 ? targetPath : ".",
  );
  if (!isPathInsideWorkspace(workspaceRoot, resolvedPath)) {
    throw new Error("Path escapes the selected workspace.");
  }
  return resolvedPath;
}

function shouldIgnoreEntry(entryName: string, isDirectory: boolean): boolean {
  if (!isDirectory) {
    return false;
  }
  return IGNORED_DIRECTORY_NAMES.has(entryName);
}

function toWorkspaceTree(
  workspaceRoot: string,
  directoryPath: string,
  depth: number,
): readonly CaqliDesktopWorkspaceEntry[] {
  if (depth > DEFAULT_MAX_DEPTH) {
    return [];
  }

  const directoryEntries = FS.readdirSync(directoryPath, { withFileTypes: true })
    .filter((entry) => !shouldIgnoreEntry(entry.name, entry.isDirectory()))
    .sort((left, right) => {
      if (left.isDirectory() !== right.isDirectory()) {
        return left.isDirectory() ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    })
    .slice(0, DEFAULT_MAX_ENTRIES_PER_DIRECTORY);

  return directoryEntries.map((entry) => {
    const absolutePath = Path.join(directoryPath, entry.name);
    const relativePath = Path.relative(workspaceRoot, absolutePath) || ".";
    if (entry.isDirectory()) {
      return {
        name: entry.name,
        path: relativePath,
        kind: "directory",
        children: toWorkspaceTree(workspaceRoot, absolutePath, depth + 1),
      } satisfies CaqliDesktopWorkspaceEntry;
    }
    return {
      name: entry.name,
      path: relativePath,
      kind: "file",
    } satisfies CaqliDesktopWorkspaceEntry;
  });
}

export function readWorkspaceTree(workspaceDir: string): readonly CaqliDesktopWorkspaceEntry[] {
  const workspaceRoot = normalizeWorkspaceRoot(workspaceDir);
  const stat = FS.statSync(workspaceRoot);
  if (!stat.isDirectory()) {
    throw new Error("Workspace path must be a directory.");
  }
  return toWorkspaceTree(workspaceRoot, workspaceRoot, 1);
}

export function readWorkspaceFile(workspaceDir: string, filePath: string): string {
  const absolutePath = resolveWorkspacePath(workspaceDir, filePath);
  const stat = FS.statSync(absolutePath);
  if (!stat.isFile()) {
    throw new Error("Selected path is not a file.");
  }
  const content = FS.readFileSync(absolutePath, "utf8");
  if (content.length <= DEFAULT_MAX_FILE_CHARS) {
    return content;
  }
  return `${content.slice(0, DEFAULT_MAX_FILE_CHARS)}\n\n[Truncated to ${DEFAULT_MAX_FILE_CHARS.toLocaleString()} characters]`;
}

export function maskCaqliApiKey(apiKey: string | null | undefined): string | null {
  if (!apiKey) {
    return null;
  }
  const trimmed = apiKey.trim();
  if (trimmed.length <= 12) {
    return trimmed;
  }
  return `${trimmed.slice(0, 8)}...${trimmed.slice(-4)}`;
}
