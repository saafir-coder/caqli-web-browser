import { MaterialIcon } from "../onboarding/HostedOnboardingShell";

export function HostedWorkspaceComposer(props: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  modelLabel?: string;
  disabled?: boolean;
}) {
  const { value, onChange, onSubmit, modelLabel = "GPT-4o", disabled } = props;

  return (
    <div className="border-t border-[#333333] bg-black px-3 pb-2 pt-3">
      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          if (!disabled && value.trim()) {
            onSubmit();
          }
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Message Caqli"
          disabled={disabled}
          className="w-full border border-[#333333] bg-[#1A1A1A] py-3 pl-3 pr-12 text-sm text-white outline-none placeholder:text-[#6B7280] focus:border-[#9CA3AF] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center bg-white text-black transition-opacity disabled:opacity-40"
          aria-label="Send message"
        >
          <MaterialIcon name="send" className="text-[18px]" />
        </button>
      </form>

      <div className="mt-2 flex items-center justify-between text-xs text-[#9CA3AF]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-1 opacity-60"
            disabled
            title="Coming soon"
          >
            <MaterialIcon name="attach_file" className="text-[16px]" />
            Attach
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 opacity-60"
            disabled
            title="Coming soon"
          >
            <MaterialIcon name="language" className="text-[16px]" />
            Search
          </button>
        </div>
        <span className="text-[11px] text-[#6B7280]">{modelLabel}</span>
      </div>
    </div>
  );
}
