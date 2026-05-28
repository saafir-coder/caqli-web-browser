import { Link, useRouterState } from "@tanstack/react-router";

import { MaterialIcon } from "../onboarding/HostedOnboardingShell";
import { cn } from "~/lib/utils";

type TabId = "chat" | "code" | "data" | "config";

const TABS: { id: TabId; label: string; icon: string; to?: string; soon?: boolean }[] = [
  { id: "chat", label: "Chat", icon: "grid_view", to: "/" },
  { id: "code", label: "Code", icon: "code", to: "/code" },
  { id: "data", label: "Data", icon: "bar_chart", soon: true },
  { id: "config", label: "Config", icon: "settings", soon: true },
];

function resolveActiveTab(pathname: string): TabId {
  if (pathname.startsWith("/settings")) {
    return "config";
  }
  if (pathname.startsWith("/code")) {
    return "code";
  }
  return "chat";
}

export function HostedWorkspaceBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = resolveActiveTab(pathname);

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 flex h-[calc(3.5rem+env(safe-area-inset-bottom))] w-full max-w-[480px] -translate-x-1/2 items-stretch justify-around border-t border-[#333333] bg-black px-1 pb-[env(safe-area-inset-bottom)]"
      aria-label="Main"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id && !tab.soon;
        const inner = (
          <>
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-md",
                isActive ? "bg-[#2B2B2B]" : "",
              )}
            >
              <MaterialIcon
                name={tab.icon}
                className={cn("text-[20px]", isActive ? "text-white" : "text-[#9CA3AF]")}
              />
            </span>
            <span
              className={cn("text-[10px] font-medium", isActive ? "text-white" : "text-[#9CA3AF]")}
            >
              {tab.label}
            </span>
            {tab.soon ? <span className="sr-only">Coming soon</span> : null}
          </>
        );

        if (tab.to && !tab.soon) {
          return (
            <Link
              key={tab.id}
              to={tab.to}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
            >
              {inner}
            </Link>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            disabled={tab.soon}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 opacity-60"
            title={tab.soon ? "Coming soon" : tab.label}
          >
            {inner}
          </button>
        );
      })}
    </nav>
  );
}
