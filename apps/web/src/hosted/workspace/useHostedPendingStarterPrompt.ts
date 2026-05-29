import { useEffect, useRef } from "react";

import { HOSTED_PENDING_STARTER_PROMPT_KEY } from "./hostedStarterChips";

/** Applies a chip-selected prompt once after navigation to a new thread. */
export function useHostedPendingStarterPrompt(applyPrompt: (prompt: string) => void) {
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) {
      return;
    }
    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem(HOSTED_PENDING_STARTER_PROMPT_KEY);
    } catch {
      pending = null;
    }
    if (!pending?.trim()) {
      return;
    }
    appliedRef.current = true;
    try {
      sessionStorage.removeItem(HOSTED_PENDING_STARTER_PROMPT_KEY);
    } catch {
      /* ignore */
    }
    applyPrompt(pending.trim());
  }, [applyPrompt]);
}
