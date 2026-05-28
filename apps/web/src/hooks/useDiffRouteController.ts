import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import {
  buildDiffSearchClosed,
  buildDiffSearchOpen,
  buildDiffSearchToggled,
  diffRouteNavigateOptions,
  isDiffRouteOpen,
  parseDiffRouteSearch,
  type DiffRouteTarget,
  type DiffTurnSelection,
} from "../lib/diffRouteController";

function useDiffPanelMountRetention(mountKey: string | null, diffOpen: boolean) {
  const [mountState, setMountState] = useState(() => ({
    key: mountKey,
    hasOpenedDiff: diffOpen,
  }));

  const hasOpenedDiff =
    mountState.key === mountKey ? mountState.hasOpenedDiff : diffOpen;

  const markDiffOpened = useCallback(() => {
    setMountState((previous) => {
      if (previous.key === mountKey && previous.hasOpenedDiff) {
        return previous;
      }
      return {
        key: mountKey,
        hasOpenedDiff: true,
      };
    });
  }, [mountKey]);

  return { hasOpenedDiff, markDiffOpened };
}

export function useDiffRouteController(
  target: DiffRouteTarget | null,
  mountKey: string | null,
) {
  const navigate = useNavigate();
  const diffSearch = useSearch({
    strict: false,
    select: (search) => parseDiffRouteSearch(search),
  });
  const diffOpen = isDiffRouteOpen(diffSearch);
  const { hasOpenedDiff, markDiffOpened } = useDiffPanelMountRetention(mountKey, diffOpen);
  const shouldRenderDiffContent = diffOpen || hasOpenedDiff;

  const navigateDiff = useCallback(
    (
      search: (previous: Record<string, unknown>) => Record<string, unknown>,
      options?: { replace?: boolean },
    ) => {
      if (!target) {
        return;
      }
      void navigate(diffRouteNavigateOptions(target, search, options));
    },
    [navigate, target],
  );

  const openDiff = useCallback(
    (selection?: DiffTurnSelection) => {
      markDiffOpened();
      navigateDiff((previous) => buildDiffSearchOpen(previous, selection));
    },
    [markDiffOpened, navigateDiff],
  );

  const closeDiff = useCallback(() => {
    navigateDiff((previous) => buildDiffSearchClosed(previous));
  }, [navigateDiff]);

  const toggleDiff = useCallback(
    (options?: { replace?: boolean; selection?: DiffTurnSelection }) => {
      if (!diffOpen) {
        markDiffOpened();
      }
      navigateDiff((previous) => buildDiffSearchToggled(previous, diffOpen, options?.selection), {
        ...(options?.replace ? { replace: true } : {}),
      });
    },
    [diffOpen, markDiffOpened, navigateDiff],
  );

  const openTurnDiff = useCallback(
    (selection: DiffTurnSelection) => {
      markDiffOpened();
      navigateDiff((previous) => buildDiffSearchOpen(previous, selection));
    },
    [markDiffOpened, navigateDiff],
  );

  const selectTurn = useCallback(
    (turnId: DiffTurnSelection["turnId"]) => {
      if (!turnId) {
        return;
      }
      openTurnDiff({ turnId });
    },
    [openTurnDiff],
  );

  const selectWholeConversation = useCallback(() => {
    openDiff();
  }, [openDiff]);

  return {
    diffSearch,
    diffOpen,
    hasOpenedDiff,
    shouldRenderDiffContent,
    markDiffOpened,
    openDiff,
    closeDiff,
    toggleDiff,
    openTurnDiff,
    selectTurn,
    selectWholeConversation,
  };
}
