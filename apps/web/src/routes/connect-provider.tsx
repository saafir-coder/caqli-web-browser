import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { connectCodexProvider } from "../hosted/hostedCodexConnection";
import { HostedAuthPageChrome } from "../hosted/HostedAuthPageChrome";
import { isHostedAuthConfigured } from "../hosted/config";
import { readHostedProfileComplete } from "../hosted/onboardingStorage";
import { AGENT_PROVIDERS, ProviderKind } from "../hosted/providers/registry";

export const Route = createFileRoute("/connect-provider")({
  beforeLoad: async ({ context }) => {
    if (!isHostedAuthConfigured()) {
      throw redirect({ to: "/pair", replace: true });
    }
    if (context.authGateState.status !== "authenticated") {
      throw redirect({ to: "/welcome", replace: true });
    }
    if (!readHostedProfileComplete()) {
      throw redirect({ to: "/onboarding", replace: true });
    }
  },
  component: ConnectProviderPage,
});

function ConnectProviderPage() {
  const navigate = useNavigate();
  const [codexKey, setCodexKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConnectCodex(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = codexKey.trim();
    if (!trimmed) {
      setError("Enter your Codex API key.");
      return;
    }
    setBusy(true);
    try {
      await connectCodexProvider(trimmed);
      void navigate({ to: "/", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect Codex.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <HostedAuthPageChrome title="Connect a provider">
      <p className="text-base leading-relaxed text-[#9CA3AF]">
        Model usage bills to your provider account—not Caqli. Keys are stored on Caqli servers only
        (vault wiring in a follow-up slice).
      </p>
      <ul className="space-y-4">
        {AGENT_PROVIDERS.map((provider) => (
          <li
            key={provider.kind}
            className="rounded border border-[#333333] bg-[#1A1A1A] px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium text-white">{provider.label}</h2>
                <p className="mt-1 text-sm text-[#9CA3AF]">{provider.description}</p>
              </div>
              {provider.comingSoon ? (
                <span className="shrink-0 text-xs font-medium tracking-wide text-[#9CA3AF] uppercase">
                  Coming soon
                </span>
              ) : null}
            </div>
            {provider.kind === ProviderKind.Codex && !provider.comingSoon ? (
              <form onSubmit={(e) => void onConnectCodex(e)} className="mt-4 space-y-3">
                <label className="block space-y-2">
                  <span className="text-xs font-medium tracking-wide text-[#9CA3AF] uppercase">
                    Codex API key
                  </span>
                  <input
                    type="password"
                    name="codexKey"
                    autoComplete="off"
                    value={codexKey}
                    onChange={(ev) => setCodexKey(ev.target.value)}
                    className="w-full rounded border border-[#333333] bg-black px-3 py-2.5 text-white outline-none focus:border-white"
                  />
                </label>
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded border border-[#333333] bg-[#2B2B2B] px-4 py-3 text-sm font-medium text-white hover:bg-[#3D3D3D] disabled:opacity-50"
                >
                  {busy ? "Connecting…" : "Connect Codex"}
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </HostedAuthPageChrome>
  );
}
