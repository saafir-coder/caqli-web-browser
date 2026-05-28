import { createFileRoute, retainSearchParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

import ChatView from "../components/ChatView";
import { ChatDiffRouteShell } from "../components/chat/ChatDiffRouteShell";
import { threadHasStarted } from "../components/ChatView.logic";
import { finalizePromotedDraftThreadByRef, useComposerDraftStore, DraftId } from "../composerDraftStore";
import { type DiffRouteSearch, parseDiffRouteSearch } from "../diffRouteSearch";
import { useDiffRouteController } from "../hooks/useDiffRouteController";
import { createThreadSelectorAcrossEnvironments } from "../storeSelectors";
import { useStore } from "../store";
import { buildThreadRouteParams } from "../threadRoutes";
import { isDiffRouteOpen } from "../lib/diffRouteController";

function DraftChatThreadRouteView() {
  const navigate = useNavigate();
  const { draftId: rawDraftId } = Route.useParams();
  const draftId = DraftId.make(rawDraftId);
  const search = Route.useSearch();
  const draftSession = useComposerDraftStore((store) => store.getDraftSession(draftId));
  const serverThread = useStore(
    useMemo(
      () => createThreadSelectorAcrossEnvironments(draftSession?.threadId ?? null),
      [draftSession?.threadId],
    ),
  );
  const serverThreadStarted = threadHasStarted(serverThread);
  const canonicalThreadRef = useMemo(
    () =>
      draftSession?.promotedTo
        ? serverThreadStarted
          ? draftSession.promotedTo
          : null
        : serverThread
          ? {
              environmentId: serverThread.environmentId,
              threadId: serverThread.id,
            }
          : null,
    [draftSession?.promotedTo, serverThread, serverThreadStarted],
  );

  const diffRoute = useDiffRouteController(
    draftSession ? { kind: "draft", draftId } : null,
    `draft:${draftId}`,
  );
  const diffOpen = isDiffRouteOpen(search);

  useEffect(() => {
    if (!canonicalThreadRef) {
      return;
    }
    void navigate({
      to: "/$environmentId/$threadId",
      params: buildThreadRouteParams(canonicalThreadRef),
      replace: true,
      ...(diffOpen ? { search: { diff: "1" as const } } : {}),
    });
  }, [canonicalThreadRef, diffOpen, navigate]);

  useEffect(() => {
    if (draftSession || canonicalThreadRef) {
      return;
    }
    void navigate({ to: "/", replace: true });
  }, [canonicalThreadRef, draftSession, navigate]);

  if (canonicalThreadRef) {
    return null;
  }

  if (!draftSession) {
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
        draftId={draftId}
        environmentId={draftSession.environmentId}
        threadId={draftSession.threadId}
        onDiffPanelOpen={diffRoute.markDiffOpened}
        reserveTitleBarControlInset={!diffRoute.diffOpen}
        routeKind="draft"
      />
    </ChatDiffRouteShell>
  );
}

export const Route = createFileRoute("/_chat/draft/$draftId")({
  validateSearch: (search) => parseDiffRouteSearch(search),
  search: {
    middlewares: [retainSearchParams<DiffRouteSearch>(["diff"])],
  },
  component: DraftChatThreadRouteView,
});
