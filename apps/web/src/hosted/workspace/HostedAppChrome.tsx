import type { ReactNode } from "react";

import "../onboarding/hostedOnboarding.css";
import { HostedWorkspaceBottomNav } from "./HostedWorkspaceBottomNav";

/**
 * Hosted main-app chrome: centers content like Stitch mobile (390px) and pins bottom nav.
 * Sidebar layout stays full-width; only the main column is constrained.
 */
export function HostedAppChrome(props: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-black pb-[calc(3.5rem+env(safe-area-inset-bottom))] text-white">
      <div className="mx-auto flex min-h-0 w-full max-w-[480px] flex-1 flex-col bg-black font-sans text-white">
        {props.children}
      </div>
      <HostedWorkspaceBottomNav />
    </div>
  );
}
