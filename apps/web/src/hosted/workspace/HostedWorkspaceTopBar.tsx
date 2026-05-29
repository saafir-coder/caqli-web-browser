import { useSidebar } from "~/components/ui/sidebar";
import { MaterialIcon } from "../onboarding/HostedOnboardingShell";

export function HostedWorkspaceTopBar() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-40 flex h-12 w-full shrink-0 items-center justify-between border-b border-[#333333] bg-black px-3">
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex size-9 items-center justify-center text-[#9CA3AF] hover:text-white"
        aria-label="Open menu"
      >
        <MaterialIcon name="menu" className="text-[22px]" />
      </button>
      <span className="text-lg font-semibold tracking-tight text-white">Caqli</span>
      <span className="flex size-9 items-center justify-center" aria-label="Connected">
        <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
      </span>
    </header>
  );
}
