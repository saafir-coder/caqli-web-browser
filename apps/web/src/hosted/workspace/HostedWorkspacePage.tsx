import { useEffect, useRef, useState } from "react";

import { SidebarInset } from "~/components/ui/sidebar";
import { useHandleNewThread } from "~/hooks/useHandleNewThread";
import { HostedChatEmptyState } from "./HostedChatEmptyState";
import { HOSTED_PENDING_STARTER_PROMPT_KEY } from "./hostedStarterChips";
import { HostedWorkspaceComposer } from "./HostedWorkspaceComposer";
import { HostedWorkspaceTopBar } from "./HostedWorkspaceTopBar";

export function HostedWorkspacePage() {
  const { defaultProjectRef, handleNewThread } = useHandleNewThread();
  const [composerValue, setComposerValue] = useState("");
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current || !defaultProjectRef) {
      return;
    }
    bootstrappedRef.current = true;
    void handleNewThread(defaultProjectRef);
  }, [defaultProjectRef, handleNewThread]);

  async function startWithPrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || !defaultProjectRef) {
      return;
    }
    try {
      sessionStorage.setItem(HOSTED_PENDING_STARTER_PROMPT_KEY, trimmed);
    } catch {
      /* ignore */
    }
    await handleNewThread(defaultProjectRef);
  }

  return (
    <SidebarInset className="relative isolate z-0 flex min-h-0 flex-1 flex-col overflow-hidden bg-black text-white">
      <HostedWorkspaceTopBar />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <HostedChatEmptyState onSelectChip={(prompt) => void startWithPrompt(prompt)} />
      </div>
      <HostedWorkspaceComposer
        value={composerValue}
        onChange={setComposerValue}
        disabled={!defaultProjectRef}
        onSubmit={() => void startWithPrompt(composerValue)}
      />
    </SidebarInset>
  );
}
