import { scopeProjectRef, scopeThreadRef } from "@t3tools/client-runtime";
import {
  DEFAULT_MODEL_BY_PROVIDER,
  type EnvironmentId,
  type ModelSelection,
  type ProjectId,
  type ScopedThreadRef,
  type ThreadId,
} from "@t3tools/contracts";
import { projectScriptCwd } from "@t3tools/shared/projectScripts";

import { buildLocalDraftThread } from "../components/ChatView.logic";
import type { DraftId, DraftThreadState } from "../composerDraftStore";
import type { Project, Thread } from "../types";
import { resolveThreadRouteRef } from "../threadRoutes";

export interface ActiveThreadContext {
  readonly routeThreadRef: ScopedThreadRef | null;
  readonly serverThread: Thread | undefined;
  readonly draftThread: DraftThreadState | null;
  readonly activeThread: Thread | undefined;
  readonly isServerThread: boolean;
  readonly isLocalDraftThread: boolean;
  readonly activeProject: Project | undefined;
  readonly gitCwd: string | null;
  readonly environmentId: EnvironmentId | null;
  readonly threadId: ThreadId | null;
}

export function resolveRouteThreadRefFromParams(
  routeParams: Record<string, string | undefined>,
  draftSession: DraftThreadState | null,
): ScopedThreadRef | null {
  const fromServerRoute = resolveThreadRouteRef(routeParams);
  if (fromServerRoute) {
    return fromServerRoute;
  }
  if (!draftSession) {
    return null;
  }
  return scopeThreadRef(draftSession.environmentId, draftSession.threadId);
}

export function resolveActiveThread(input: {
  routeThreadRef: ScopedThreadRef | null;
  routeKind?: "server" | "draft";
  serverThread: Thread | undefined;
  draftThread: DraftThreadState | null;
  draftProjectDefaultModel?: ModelSelection | null;
  localDraftError?: string | null;
}): Pick<
  ActiveThreadContext,
  "activeThread" | "isServerThread" | "isLocalDraftThread" | "serverThread" | "draftThread"
> {
  const { routeThreadRef, routeKind, serverThread, draftThread, localDraftError } = input;
  const localDraftThread =
    draftThread && routeThreadRef
      ? buildLocalDraftThread(
          routeThreadRef.threadId,
          draftThread,
          input.draftProjectDefaultModel ?? {
            provider: "codex",
            model: DEFAULT_MODEL_BY_PROVIDER.codex,
          },
          localDraftError ?? null,
        )
      : undefined;

  const isServerThread = routeKind === "server" && serverThread !== undefined;
  const activeThread = isServerThread ? serverThread : localDraftThread;
  const isLocalDraftThread = !isServerThread && localDraftThread !== undefined;

  return {
    serverThread,
    draftThread,
    activeThread,
    isServerThread,
    isLocalDraftThread,
  };
}

export function resolveGitCwd(input: {
  activeThread: Thread | undefined;
  activeProject: Project | undefined;
}): string | null {
  if (!input.activeProject) {
    return null;
  }
  return projectScriptCwd({
    project: { cwd: input.activeProject.cwd },
    worktreePath: input.activeThread?.worktreePath ?? null,
  });
}

export function resolveActiveProjectRef(input: {
  activeThread: Thread | undefined;
}): { environmentId: EnvironmentId; projectId: ProjectId } | null {
  if (!input.activeThread?.projectId) {
    return null;
  }
  return scopeProjectRef(input.activeThread.environmentId, input.activeThread.projectId);
}
