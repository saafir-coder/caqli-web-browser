import { createFileRoute, retainSearchParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

import ChatView from "../components/ChatView";
import { ChatDiffRouteShell } from "../components/chat/ChatDiffRouteShell";
import { threadHasStarted } from "../components/ChatView.logic";
import { finalizePromotedDraftThreadByRef, useComposerDraftStore } from "../composerDraftStore";
import { type DiffRouteSearch, parseDiffRouteSearch } from "../diffRouteSearch";
import { useDiffRouteController } from "../hooks/useDiffRouteController";
import { selectEnvironmentState, selectThreadExistsByRef, useStore } from "../store";
import { createThreadSelectorByRef } from "../storeSelectors";
import { resolveThreadRouteRef } from "../threadRoutes";

function ChatThreadRouteView() {
  const navigate = useNavigate();
  const threadRef = Route.useParams({
    select: (params) => resolveThreadRouteRef(params),
  });
  const bootstrapComplete = useStore(
    (store) => selectEnvironmentState(store, threadRef?.environmentId ?? null).bootstrapComplete,
  );
  const serverThread = useStore(useMemo(() => createThreadSelectorByRef(threadRef), [threadRef]));
  const threadExists = useStore((store) => selectThreadExistsByRef(store, threadRef));
  const environmentHasServerThreads = useStore(
    (store) => selectEnvironmentState(store, threadRef?.environmentId ?? null).threadIds.length > 0,
  );
  const draftThreadExists = useComposerDraftStore((store) =>
    threadRef ? store.getDraftThreadByRef(threadRef) !== null : false,
  );
  const draftThread = useComposerDraftStore((store) =>
    threadRef ? store.getDraftThreadByRef(threadRef) : null,
  );
  const environmentHasDraftThreads = useComposerDraftStore((store) => {
    if (!threadRef) {
      return false;
    }
    return store.hasDraftThreadsInEnvironment(threadRef.environmentId);
  });
  const routeThreadExists = threadExists || draftThreadExists;
  const serverThreadStarted = threadHasStarted(serverThread);
  const environmentHasAnyThreads = environmentHasServerThreads || environmentHasDraftThreads;

  const diffRoute = useDiffRouteController(
    threadRef
      ? {
          kind: "server",
          environmentId: threadRef.environmentId,
          threadId: threadRef.threadId,
        }
      : null,
    threadRef ? `${threadRef.environmentId}:${threadRef.threadId}` : null,
  );

  useEffect(() => {
    if (!threadRef || !bootstrapComplete) {
      return;
    }

    if (!routeThreadExists && environmentHasAnyThreads) {
      void navigate({ to: "/", replace: true });
    }
  }, [bootstrapComplete, environmentHasAnyThreads, navigate, routeThreadExists, threadRef]);

  useEffect(() => {
    if (!threadRef || !serverThreadStarted || !draftThread?.promotedTo) {
      return;
    }
    finalizePromotedDraftThreadByRef(threadRef);
  }, [draftThread?.promotedTo, serverThreadStarted, threadRef]);

  if (!threadRef || !bootstrapComplete || !routeThreadExists) {
    return null;
  }

  return (
    <ChatDiffRouteShell
      diffOpen={diffRoute.diffOpen}
      onCloseDiff={diffRoute.closeDiff}
      onOpenDiff={diffRoute.openDiff}
      shouldRenderDiffContent={diffRoute.shouldRenderDiffContent}
      reserveTitleBarControlInset={!diffRoute.diffOpen}
    >
      <ChatView
        environmentId={threadRef.environmentId}
        threadId={threadRef.threadId}
        onDiffPanelOpen={diffRoute.markDiffOpened}
        reserveTitleBarControlInset={!diffRoute.diffOpen}
        routeKind="server"
      />
    </ChatDiffRouteShell>
  );
}

export const Route = createFileRoute("/_chat/$environmentId/$threadId")({
  validateSearch: (search) => parseDiffRouteSearch(search),
  search: {
    middlewares: [retainSearchParams<DiffRouteSearch>(["diff"])],
  },
  component: ChatThreadRouteView,
});
