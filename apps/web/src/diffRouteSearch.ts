import { TurnId } from "@t3tools/contracts";

export interface DiffRouteSearch {
  diff?: "1" | undefined;
  diffTurnId?: TurnId | undefined;
  diffFilePath?: string | undefined;
}

function isDiffOpenValue(value: unknown): boolean {
  if (value === "1" || value === 1 || value === true) {
    return true;
  }
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (trimmed === "1") {
    return true;
  }

  // TanStack Router can serialize string search params as JSON (e.g. diff=%221%22).
  if (trimmed === '"1"' || trimmed === "'1'") {
    return true;
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    return parsed === "1" || parsed === 1 || parsed === true;
  } catch {
    return false;
  }
}

function normalizeSearchString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function stripDiffSearchParams<T extends Record<string, unknown>>(
  params: T,
): Omit<T, "diff" | "diffTurnId" | "diffFilePath"> {
  const { diff: _diff, diffTurnId: _diffTurnId, diffFilePath: _diffFilePath, ...rest } = params;
  return rest as Omit<T, "diff" | "diffTurnId" | "diffFilePath">;
}

export function isDiffRouteOpen(search: DiffRouteSearch | Record<string, unknown>): boolean {
  if ("diff" in search && search.diff === "1") {
    return true;
  }
  return parseDiffRouteSearch(search as Record<string, unknown>).diff === "1";
}

export function parseDiffRouteSearch(search: Record<string, unknown>): DiffRouteSearch {
  const diff = isDiffOpenValue(search.diff) ? "1" : undefined;
  const diffTurnIdRaw = diff ? normalizeSearchString(search.diffTurnId) : undefined;
  const diffTurnId = diffTurnIdRaw ? TurnId.make(diffTurnIdRaw) : undefined;
  const diffFilePath = diff && diffTurnId ? normalizeSearchString(search.diffFilePath) : undefined;

  return {
    ...(diff ? { diff } : {}),
    ...(diffTurnId ? { diffTurnId } : {}),
    ...(diffFilePath ? { diffFilePath } : {}),
  };
}
