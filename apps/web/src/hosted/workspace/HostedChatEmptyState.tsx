import { MaterialIcon } from "../onboarding/HostedOnboardingShell";
import { HOSTED_STARTER_CHIPS } from "./hostedStarterChips";

export function HostedChatEmptyState(props: { onSelectChip: (prompt: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
      <div className="flex size-14 items-center justify-center rounded border border-[#333333] bg-[#1A1A1A]">
        <MaterialIcon name="terminal" className="text-[28px] text-white" />
      </div>

      <div className="flex max-w-[320px] flex-col gap-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          What do you want to build?
        </h2>
        <p className="text-sm leading-relaxed text-[#9CA3AF]">
          Start a new technical journey or continue your progress.
        </p>
      </div>

      <ul className="flex w-full max-w-[360px] flex-col gap-2">
        {HOSTED_STARTER_CHIPS.map((chip) => (
          <li key={chip.id}>
            <button
              type="button"
              onClick={() => props.onSelectChip(chip.prompt)}
              className="flex w-full items-center justify-between border border-[#333333] bg-[#1A1A1A] px-4 py-3 text-left text-sm text-white transition-colors hover:bg-[#2B2B2B]"
            >
              <span>{chip.label}</span>
              <MaterialIcon name="chevron_right" className="text-[20px] text-[#9CA3AF]" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
