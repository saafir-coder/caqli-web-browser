import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { createHostedProject, HOSTED_ACTIVE_PROJECT_ID_KEY } from "../hosted/controlPlane/projects";
import { HostedAuthPageChrome } from "../hosted/HostedAuthPageChrome";
import { isHostedAuthConfigured } from "../hosted/config";
import { writeHostedProfileComplete } from "../hosted/onboardingStorage";
import { getSupabaseBrowserClient } from "../hosted/supabaseClient";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async ({ context }) => {
    if (!isHostedAuthConfigured()) {
      throw redirect({ to: "/pair", replace: true });
    }
    if (context.authGateState.status !== "authenticated") {
      throw redirect({ to: "/welcome", replace: true });
    }
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("My first project");
  const [busy, setBusy] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name your project.");
      return;
    }
    setBusy(true);
    setProvisioning(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        setError("Your session expired. Sign in again from the welcome screen.");
        return;
      }

      const project = await createHostedProject(supabase, userId, trimmed);

      try {
        globalThis.localStorage?.setItem("caqli.hostedFirstProjectName", trimmed);
        globalThis.localStorage?.setItem(HOSTED_ACTIVE_PROJECT_ID_KEY, project.id);
      } catch {
        /* ignore */
      }

      writeHostedProfileComplete();
      void navigate({ to: "/connect-provider", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setProvisioning(false);
      setBusy(false);
    }
  }

  return (
    <HostedAuthPageChrome title="Name your first project">
      <p className="text-base leading-relaxed text-[#9CA3AF]">
        We&apos;ll provision a workspace for this project. You can rename or add more projects
        later.
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-medium tracking-wide text-[#9CA3AF] uppercase">
            Project name
          </span>
          <input
            type="text"
            name="project"
            autoComplete="off"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            className="w-full rounded border border-[#333333] bg-black px-3 py-2.5 text-white outline-none focus:border-white"
          />
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded border border-[#333333] bg-[#2B2B2B] px-4 py-3 text-sm font-medium text-white hover:bg-[#3D3D3D] disabled:opacity-50"
        >
          {provisioning ? "Provisioning workspace…" : busy ? "Continuing…" : "Continue"}
        </button>
      </form>
    </HostedAuthPageChrome>
  );
}
