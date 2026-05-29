import { scopeThreadRef } from "@t3tools/client-runtime";
import type { TurnId } from "@t3tools/contracts";
import { Link, useNavigate, type LinkProps } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { ChangedFilesTree } from "~/components/chat/ChangedFilesTree";
import { DiffStatLabel, hasNonZeroStat } from "~/components/chat/DiffStatLabel";
import { SidebarInset } from "~/components/ui/sidebar";
import { useTheme } from "~/hooks/useTheme";
import { refreshGitStatus, useGitStatus } from "~/lib/gitStatusState";
import { summarizeTurnDiffStats } from "~/lib/turnDiffTree";
import { stripDiffSearchParams } from "~/diffRouteSearch";
import { buildThreadRouteParams } from "~/threadRoutes";
import { useTurnDiffSummaries } from "~/hooks/useTurnDiffSummaries";

import { MaterialIcon } from "../onboarding/HostedOnboardingShell";
import { mapWorkingTreeFiles } from "./mapWorkingTreeFiles";
import { HostedWorkspaceTopBar } from "./HostedWorkspaceTopBar";
import { useHostedActiveServerThread, useHostedThreadGitCwd } from "./useHostedActiveServerThread";

function resolveTurnIdForFilePath(
  turnDiffSummaries: ReadonlyArray<{ turnId: TurnId; files: ReadonlyArray<{ path: string }> }>,
  filePath: string,
): TurnId | null {
  for (let index = turnDiffSummaries.length - 1; index >= 0; index -= 1) {
    const summary = turnDiffSummaries[index];
    if (!summary) {
      continue;
    }
    if (summary.files.some((file) => file.path === filePath)) {
      return summary.turnId;
    }
  }
  return turnDiffSummaries[turnDiffSummaries.length - 1]?.turnId ?? null;
}

export function HostedWorkspaceCodePage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const activeThread = useHostedActiveServerThread();
  const gitCwd = useHostedThreadGitCwd(activeThread);
  const gitStatus = useGitStatus({
    environmentId: activeThread?.environmentId ?? null,
    cwd: activeThread?.branch != null ? gitCwd : null,
  });
  const { turnDiffSummaries } = useTurnDiffSummaries(activeThread ?? undefined);
  const [allDirectoriesExpanded, setAllDirectoriesExpanded] = useState(true);

  useEffect(() => {
    if (!activeThread || gitCwd === null) {
      return;
    }
    void refreshGitStatus({
      environmentId: activeThread.environmentId,
      cwd: gitCwd,
    });
  }, [activeThread, gitCwd]);

  const changedFiles = useMemo(
    () => mapWorkingTreeFiles(gitStatus.data?.workingTree.files ?? []),
    [gitStatus.data?.workingTree.files],
  );
  const summaryStat = useMemo(() => summarizeTurnDiffStats(changedFiles), [changedFiles]);
  const treeTurnId = turnDiffSummaries[turnDiffSummaries.length - 1]?.turnId ?? null;
  const branchLabel = gitStatus.data?.branch ?? activeThread?.branch ?? "—";

  const openFileDiff = (filePath?: string) => {
    if (!activeThread || !treeTurnId) {
      return;
    }
    const diffTurnId =
      filePath !== undefined ? resolveTurnIdForFilePath(turnDiffSummaries, filePath) : treeTurnId;
    if (!diffTurnId) {
      return;
    }
    void navigate({
      to: "/$environmentId/$threadId",
      params: buildThreadRouteParams(scopeThreadRef(activeThread.environmentId, activeThread.id)),
      search: (previous) => {
        const rest = stripDiffSearchParams(previous);
        return {
          ...rest,
          diff: "1" as const,
          diffTurnId,
          ...(filePath ? { diffFilePath: filePath } : {}),
        };
      },
    });
  };

  return (
    <SidebarInset className="relative isolate z-0 flex min-h-0 flex-1 flex-col overflow-hidden bg-black text-white">
      <HostedWorkspaceTopBar />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4 pt-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-white">Changes</h1>
            <p className="mt-0.5 truncate font-mono text-[11px] text-[#9CA3AF]">{branchLabel}</p>
          </div>
          {changedFiles.length > 0 ? (
            <button
              type="button"
              className="shrink-0 rounded-md border border-[#333333] px-2 py-1 text-[11px] text-[#9CA3AF] hover:text-white"
              onClick={() => setAllDirectoriesExpanded((value) => !value)}
            >
              {allDirectoriesExpanded ? "Collapse all" : "Expand all"}
            </button>
          ) : null}
        </div>

        {!activeThread ? (
          <HostedCodeEmptyState
            title="No active thread"
            description="Start a chat thread to see file changes from the agent."
            actionLabel="Open Chat"
            chatLink={{ to: "/" }}
          />
        ) : gitStatus.isPending && gitStatus.data === null ? (
          <p className="text-sm text-[#9CA3AF]">Loading changes…</p>
        ) : gitStatus.data && !gitStatus.data.isRepo ? (
          <HostedCodeEmptyState
            title="Not a git repository"
            description="This project workspace is not a git repo yet, so there are no tracked changes."
            actionLabel="Back to Chat"
            chatLink={{ to: "/" }}
          />
        ) : changedFiles.length === 0 ? (
          <HostedCodeEmptyState
            title="No file changes"
            description="When the agent edits files, they will show up here like in Cursor."
            actionLabel="Back to Chat"
            chatLink={
              activeThread
                ? {
                    to: "/$environmentId/$threadId",
                    params: buildThreadRouteParams(
                      scopeThreadRef(activeThread.environmentId, activeThread.id),
                    ),
                  }
                : { to: "/" }
            }
          />
        ) : (
          <div className="rounded-lg border border-[#333333] bg-[#1A1A1A] p-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#9CA3AF]">
                <span>{changedFiles.length} changed files</span>
                {hasNonZeroStat(summaryStat) ? (
                  <>
                    <span className="mx-1">•</span>
                    <DiffStatLabel additions={summaryStat.additions} deletions={summaryStat.deletions} />
                  </>
                ) : null}
              </p>
              {treeTurnId ? (
                <button
                  type="button"
                  className="rounded-md border border-[#333333] px-2 py-1 text-[11px] text-[#9CA3AF] hover:text-white"
                  onClick={() => openFileDiff()}
                >
                  View diff
                </button>
              ) : null}
            </div>
            {treeTurnId ? (
              <ChangedFilesTree
                turnId={treeTurnId}
                files={changedFiles}
                allDirectoriesExpanded={allDirectoriesExpanded}
                resolvedTheme={resolvedTheme}
                onOpenTurnDiff={(_turnId, filePath) => openFileDiff(filePath)}
              />
            ) : (
              <ul className="space-y-1">
                {changedFiles.map((file) => (
                  <li key={file.path}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-[11px] text-[#E5E7EB] hover:bg-black/40"
                      onClick={() => openFileDiff(file.path)}
                    >
                      <MaterialIcon name="description" className="text-[16px] text-[#9CA3AF]" />
                      <span className="min-w-0 flex-1 truncate">{file.path}</span>
                      {file.additions !== undefined && file.deletions !== undefined ? (
                        <DiffStatLabel additions={file.additions} deletions={file.deletions} />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </SidebarInset>
  );
}

function HostedCodeEmptyState(props: {
  title: string;
  description: string;
  actionLabel: string;
  chatLink: LinkProps;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-white">{props.title}</h2>
        <p className="text-sm text-[#9CA3AF]">{props.description}</p>
      </div>
      <Link
        {...props.chatLink}
        className="rounded-md border border-[#333333] bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-white hover:bg-[#2B2B2B]"
      >
        {props.actionLabel}
      </Link>
    </div>
  );
}
