import { Suspense, lazy, useCallback, type ReactNode } from "react";

import { DiffWorkerPoolProvider } from "../DiffWorkerPoolProvider";
import {
  DiffPanelHeaderSkeleton,
  DiffPanelLoadingState,
  DiffPanelShell,
  type DiffPanelMode,
} from "../DiffPanelShell";
import { Sheet, SheetPopup } from "../ui/sheet";
import { Sidebar, SidebarInset, SidebarProvider, SidebarRail } from "../ui/sidebar";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { isHostedAuthConfigured } from "~/hosted/config";

const DiffPanel = lazy(() => import("../DiffPanel"));

const DIFF_INLINE_LAYOUT_MEDIA_QUERY = "(max-width: 1180px)";
const HOSTED_DIFF_SHEET_MEDIA_QUERY = "(max-width: 640px)";
const DIFF_INLINE_SIDEBAR_WIDTH_STORAGE_KEY = "chat_diff_sidebar_width";
const DIFF_INLINE_DEFAULT_WIDTH = "clamp(28rem,48vw,44rem)";
const DIFF_INLINE_SIDEBAR_MIN_WIDTH = 26 * 16;
const COMPOSER_COMPACT_MIN_LEFT_CONTROLS_WIDTH_PX = 208;

function DiffPanelSheet(props: {
  children: ReactNode;
  diffOpen: boolean;
  onCloseDiff: () => void;
  hostedMobile?: boolean;
}) {
  const useBottomSheet = props.hostedMobile === true;

  return (
    <Sheet
      open={props.diffOpen}
      onOpenChange={(open) => {
        if (!open) {
          props.onCloseDiff();
        }
      }}
    >
      <SheetPopup
        side={useBottomSheet ? "bottom" : "right"}
        showCloseButton={false}
        keepMounted
        backdropClassName={useBottomSheet ? "z-[100]" : undefined}
        viewportClassName={useBottomSheet ? "z-[100] pt-4" : undefined}
        className={
          useBottomSheet
            ? "h-[min(88dvh,calc(100dvh-3.5rem-env(safe-area-inset-bottom)))] max-h-none w-full max-w-none rounded-t-2xl border-x-0 border-b-0 p-0"
            : "w-[min(88vw,820px)] max-w-[820px] p-0"
        }
      >
        {props.children}
      </SheetPopup>
    </Sheet>
  );
}

function DiffLoadingFallback(props: { mode: DiffPanelMode }) {
  return (
    <DiffPanelShell mode={props.mode} header={<DiffPanelHeaderSkeleton />}>
      <DiffPanelLoadingState label="Loading diff viewer..." />
    </DiffPanelShell>
  );
}

function LazyDiffPanel(props: { mode: DiffPanelMode }) {
  return (
    <DiffWorkerPoolProvider>
      <Suspense fallback={<DiffLoadingFallback mode={props.mode} />}>
        <DiffPanel mode={props.mode} />
      </Suspense>
    </DiffWorkerPoolProvider>
  );
}

function DiffPanelInlineSidebar(props: {
  diffOpen: boolean;
  onCloseDiff: () => void;
  onOpenDiff: () => void;
  renderDiffContent: boolean;
}) {
  const { diffOpen, onCloseDiff, onOpenDiff, renderDiffContent } = props;
  const onOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        onOpenDiff();
        return;
      }
      onCloseDiff();
    },
    [onCloseDiff, onOpenDiff],
  );
  const shouldAcceptInlineSidebarWidth = useCallback(
    ({ nextWidth, wrapper }: { nextWidth: number; wrapper: HTMLElement }) => {
      const composerForm = document.querySelector<HTMLElement>("[data-chat-composer-form='true']");
      if (!composerForm) return true;
      const composerViewport = composerForm.parentElement;
      if (!composerViewport) return true;
      const previousSidebarWidth = wrapper.style.getPropertyValue("--sidebar-width");
      wrapper.style.setProperty("--sidebar-width", `${nextWidth}px`);

      const viewportStyle = window.getComputedStyle(composerViewport);
      const viewportPaddingLeft = Number.parseFloat(viewportStyle.paddingLeft) || 0;
      const viewportPaddingRight = Number.parseFloat(viewportStyle.paddingRight) || 0;
      const viewportContentWidth = Math.max(
        0,
        composerViewport.clientWidth - viewportPaddingLeft - viewportPaddingRight,
      );
      const formRect = composerForm.getBoundingClientRect();
      const composerFooter = composerForm.querySelector<HTMLElement>(
        "[data-chat-composer-footer='true']",
      );
      const composerRightActions = composerForm.querySelector<HTMLElement>(
        "[data-chat-composer-actions='right']",
      );
      const composerRightActionsWidth = composerRightActions?.getBoundingClientRect().width ?? 0;
      const composerFooterGap = composerFooter
        ? Number.parseFloat(window.getComputedStyle(composerFooter).columnGap) ||
          Number.parseFloat(window.getComputedStyle(composerFooter).gap) ||
          0
        : 0;
      const minimumComposerWidth =
        COMPOSER_COMPACT_MIN_LEFT_CONTROLS_WIDTH_PX + composerRightActionsWidth + composerFooterGap;
      const hasComposerOverflow = composerForm.scrollWidth > composerForm.clientWidth + 0.5;
      const overflowsViewport = formRect.width > viewportContentWidth + 0.5;
      const violatesMinimumComposerWidth = composerForm.clientWidth + 0.5 < minimumComposerWidth;

      if (previousSidebarWidth.length > 0) {
        wrapper.style.setProperty("--sidebar-width", previousSidebarWidth);
      } else {
        wrapper.style.removeProperty("--sidebar-width");
      }

      return !hasComposerOverflow && !overflowsViewport && !violatesMinimumComposerWidth;
    },
    [],
  );

  return (
    <SidebarProvider
      defaultOpen={false}
      open={diffOpen}
      onOpenChange={onOpenChange}
      className="w-auto min-h-0 flex-none bg-transparent"
      style={{ "--sidebar-width": DIFF_INLINE_DEFAULT_WIDTH } as React.CSSProperties}
    >
      <Sidebar
        side="right"
        collapsible="offcanvas"
        className="border-l border-border bg-card text-foreground"
        resizable={{
          minWidth: DIFF_INLINE_SIDEBAR_MIN_WIDTH,
          shouldAcceptWidth: shouldAcceptInlineSidebarWidth,
          storageKey: DIFF_INLINE_SIDEBAR_WIDTH_STORAGE_KEY,
        }}
      >
        {renderDiffContent ? <LazyDiffPanel mode="sidebar" /> : null}
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
}

export function ChatDiffRouteShell(props: {
  diffOpen: boolean;
  onCloseDiff: () => void;
  onOpenDiff: () => void;
  shouldRenderDiffContent: boolean;
  reserveTitleBarControlInset?: boolean;
  children: ReactNode;
}) {
  const shouldUseDiffSheet = useMediaQuery(DIFF_INLINE_LAYOUT_MEDIA_QUERY);
  const hostedMobileDiffSheet =
    isHostedAuthConfigured() && useMediaQuery(HOSTED_DIFF_SHEET_MEDIA_QUERY);
  const sidebarInsetClassName =
    "h-dvh min-h-0 overflow-hidden overscroll-y-none bg-background text-foreground";

  if (!shouldUseDiffSheet) {
    return (
      <>
        <SidebarInset className={sidebarInsetClassName}>
          {props.children}
        </SidebarInset>
        <DiffPanelInlineSidebar
          diffOpen={props.diffOpen}
          onCloseDiff={props.onCloseDiff}
          onOpenDiff={props.onOpenDiff}
          renderDiffContent={props.shouldRenderDiffContent}
        />
      </>
    );
  }

  return (
    <>
      <SidebarInset className={sidebarInsetClassName}>{props.children}</SidebarInset>
      <DiffPanelSheet
        diffOpen={props.diffOpen}
        onCloseDiff={props.onCloseDiff}
        hostedMobile={hostedMobileDiffSheet}
      >
        {props.shouldRenderDiffContent ? <LazyDiffPanel mode="sheet" /> : null}
      </DiffPanelSheet>
    </>
  );
}
