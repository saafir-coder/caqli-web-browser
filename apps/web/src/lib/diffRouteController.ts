import type { NavigateOptions } from "@tanstack/react-router";
import type { EnvironmentId, ThreadId, TurnId } from "@t3tools/contracts";

import type { DraftId } from "../composerDraftStore";
import {
  type DiffRouteSearch,
  isDiffRouteOpen,
  parseDiffRouteSearch,
  stripDiffSearchParams,
} from "../diffRouteSearch";
import { buildThreadRouteParams } from "../threadRoutes";

export type DiffRouteTarget =
  | { kind: "draft"; draftId: DraftId }
  | { kind: "server"; environmentId: EnvironmentId; threadId: ThreadId };

export interface DiffTurnSelection {
  turnId?: TurnId;
  filePath?: string;
}

type SearchUpdater = (previous: Record<string, unknown>) => Record<string, unknown>;

export { isDiffRouteOpen, parseDiffRouteSearch };

export function buildDiffSearchOpen(
  previous: Record<string, unknown>,
  selection?: DiffTurnSelection,
): Record<string, unknown> {
  const rest = stripDiffSearchParams(previous);
  if (!selection?.turnId) {
    return { ...rest, diff: true };
  }
  if (selection.filePath) {
    return { ...rest, diff: true, diffTurnId: selection.turnId, diffFilePath: selection.filePath };
  }
  return { ...rest, diff: true, diffTurnId: selection.turnId };
}

export function buildDiffSearchClosed(previous: Record<string, unknown>): Record<string, unknown> {
  const rest = stripDiffSearchParams(previous);
  return { ...rest };
}

export function buildDiffSearchToggled(
  previous: Record<string, unknown>,
  diffOpen: boolean,
  selection?: DiffTurnSelection,
): Record<string, unknown> {
  if (diffOpen) {
    return buildDiffSearchClosed(previous);
  }
  return buildDiffSearchOpen(previous, selection);
}

export function diffRouteNavigateOptions(
  target: DiffRouteTarget,
  search: SearchUpdater | DiffRouteSearch | Record<string, unknown>,
  options?: { replace?: boolean },
): NavigateOptions {
  const searchValue =
    typeof search === "function"
      ? search
      : () => search as Record<string, unknown>;

  const base =
    target.kind === "draft"
      ? {
          to: "/draft/$draftId" as const,
          params: { draftId: target.draftId },
          search: searchValue,
        }
      : {
          to: "/$environmentId/$threadId" as const,
          params: buildThreadRouteParams({
            environmentId: target.environmentId,
            threadId: target.threadId,
          }),
          search: searchValue,
        };

  return options?.replace === true ? { ...base, replace: true } : base;
}

export function diffRouteTargetFromThread(input: {
  draftId?: DraftId | null;
  environmentId: EnvironmentId;
  threadId: ThreadId;
  routeKind: "server" | "draft";
}): DiffRouteTarget {
  if (input.routeKind === "draft" && input.draftId) {
    return { kind: "draft", draftId: input.draftId };
  }
  return {
    kind: "server",
    environmentId: input.environmentId,
    threadId: input.threadId,
  };
}
