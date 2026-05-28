import { scopeProjectRef } from "@t3tools/client-runtime";
import type { ScopedThreadRef } from "@t3tools/contracts";
import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import {
  type ActiveThreadContext,
  resolveActiveProjectRef,
  resolveActiveThread,
  resolveGitCwd,
  resolveRouteThreadRefFromParams,
} from "../lib/activeThreadContext";
import { DraftId, useComposerDraftStore } from "../composerDraftStore";
import { selectProjectByRef, useStore } from "../store";
import { createProjectSelectorByRef, createThreadSelectorByRef } from "../storeSelectors";

export interface UseActiveThreadContextOptions {
  readonly routeThreadRef?: ScopedThreadRef | null;
  readonly routeKind?: "server" | "draft";
  readonly draftId?: DraftId | null;
  readonly localDraftError?: string | null;
}

export function useActiveThreadContext(
  options: UseActiveThreadContextOptions = {},
): ActiveThreadContext {
  const routeParams = useParams({ strict: false });
  const draftSessionFromRoute = useComposerDraftStore((store) => {
    const rawDraftId = routeParams.draftId;
    if (typeof rawDraftId !== "string" || rawDraftId.length === 0) {
      return null;
    }
    return store.getDraftSession(DraftId.make(rawDraftId));
  });

  const routeThreadRef =
    options.routeThreadRef ??
    resolveRouteThreadRefFromParams(
      routeParams as Record<string, string | undefined>,
      draftSessionFromRoute,
    );

  const serverThread = useStore(
    useMemo(() => createThreadSelectorByRef(routeThreadRef), [routeThreadRef]),
  );

  const draftThread = useComposerDraftStore((store) => {
    if (options.draftId) {
      return store.getDraftSession(options.draftId);
    }
    if (options.routeKind === "server" && routeThreadRef) {
      return store.getDraftSessionByRef(routeThreadRef);
    }
    if (routeThreadRef) {
      return store.getDraftThreadByRef(routeThreadRef);
    }
    return null;
  });

  const draftProjectRef = draftThread
    ? scopeProjectRef(draftThread.environmentId, draftThread.projectId)
    : null;

  const draftProject = useStore(
    useMemo(() => createProjectSelectorByRef(draftProjectRef), [draftProjectRef]),
  );

  const threadResolution = useMemo(
    () =>
      resolveActiveThread({
        routeThreadRef,
        ...(options.routeKind ? { routeKind: options.routeKind } : {}),
        serverThread,
        draftThread,
        ...(draftProject?.defaultModelSelection
          ? { draftProjectDefaultModel: draftProject.defaultModelSelection }
          : {}),
        ...(options.localDraftError !== undefined
          ? { localDraftError: options.localDraftError }
          : {}),
      }),
    [
      draftProject?.defaultModelSelection,
      draftThread,
      options.localDraftError,
      options.routeKind,
      routeThreadRef,
      serverThread,
    ],
  );

  const activeProjectRef = useMemo(
    () => resolveActiveProjectRef({ activeThread: threadResolution.activeThread }),
    [threadResolution.activeThread],
  );

  const activeProject = useStore((store) =>
    activeProjectRef ? selectProjectByRef(store, activeProjectRef) : undefined,
  );

  const gitCwd = useMemo(
    () => resolveGitCwd({ activeThread: threadResolution.activeThread, activeProject }),
    [activeProject, threadResolution.activeThread],
  );

  return useMemo(
    (): ActiveThreadContext => ({
      routeThreadRef,
      ...threadResolution,
      activeProject,
      gitCwd,
      environmentId:
        threadResolution.activeThread?.environmentId ?? routeThreadRef?.environmentId ?? null,
      threadId: threadResolution.activeThread?.id ?? routeThreadRef?.threadId ?? null,
    }),
    [activeProject, gitCwd, routeThreadRef, threadResolution],
  );
}
