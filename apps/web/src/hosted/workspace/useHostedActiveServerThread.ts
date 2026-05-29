import { scopedThreadKey, scopeProjectRef, scopeThreadRef } from "@t3tools/client-runtime";
import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  selectProjectByRef,
  selectThreadsAcrossEnvironments,
  useStore,
} from "../../store";
import { createThreadSelectorByRef } from "../../storeSelectors";
import { resolveThreadRouteTarget } from "../../threadRoutes";
import type { Thread } from "../../types";
import { useUiStateStore } from "../../uiStateStore";
import { readHostedActiveThreadId } from "../sessionResume";

function pickThreadByLastVisited(
  threads: readonly Thread[],
  threadLastVisitedAtById: Record<string, string | undefined>,
): Thread | null {
  let best: Thread | null = null;
  let bestVisitedAt = Number.NEGATIVE_INFINITY;

  for (const thread of threads) {
    const key = scopedThreadKey(scopeThreadRef(thread.environmentId, thread.id));
    const visitedAtRaw = threadLastVisitedAtById[key];
    const visitedAt = visitedAtRaw ? Date.parse(visitedAtRaw) : Number.NaN;
    const score = Number.isNaN(visitedAt) ? Date.parse(thread.updatedAt ?? thread.createdAt) : visitedAt;
    if (score > bestVisitedAt) {
      bestVisitedAt = score;
      best = thread;
    }
  }

  return best;
}

/** Active server thread for hosted **Code** (route thread, stored id, or last visited). */
export function useHostedActiveServerThread(): Thread | null {
  const routeTarget = useParams({
    strict: false,
    select: (params) => resolveThreadRouteTarget(params),
  });
  const routeThreadRef = routeTarget?.kind === "server" ? routeTarget.threadRef : null;
  const routeThread = useStore(useMemo(() => createThreadSelectorByRef(routeThreadRef), [routeThreadRef]));
  const allThreads = useStore(useShallow((state) => selectThreadsAcrossEnvironments(state)));
  const threadLastVisitedAtById = useUiStateStore((state) => state.threadLastVisitedAtById);

  return useMemo(() => {
    if (routeThread) {
      return routeThread;
    }

    const storedThreadId = readHostedActiveThreadId();
    if (storedThreadId) {
      const storedThread = allThreads.find((thread) => thread.id === storedThreadId);
      if (storedThread) {
        return storedThread;
      }
    }

    const activeThreads = allThreads.filter((thread) => thread.archivedAt === null);
    return pickThreadByLastVisited(activeThreads, threadLastVisitedAtById) ?? activeThreads[0] ?? null;
  }, [allThreads, routeThread, threadLastVisitedAtById]);
}

export function useHostedThreadGitCwd(thread: Thread | null): string | null {
  const project = useStore(
    useMemo(
      () => (state) =>
        thread
          ? selectProjectByRef(state, scopeProjectRef(thread.environmentId, thread.projectId))
          : null,
      [thread],
    ),
  );

  if (!thread) {
    return null;
  }

  return thread.worktreePath ?? project?.cwd ?? null;
}
