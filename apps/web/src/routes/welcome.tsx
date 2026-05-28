import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { HostedAuthPageChrome } from "../hosted/HostedAuthPageChrome";
import { isHostedAuthConfigured } from "../hosted/config";
import { readHostedProfileComplete } from "../hosted/onboardingStorage";
import { getSupabaseBrowserClient } from "../hosted/supabaseClient";

export const Route = createFileRoute("/welcome")({
  beforeLoad: async () => {
    if (!isHostedAuthConfigured()) {
      throw redirect({ to: "/pair", replace: true });
    }
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      if (readHostedProfileComplete()) {
        throw redirect({ to: "/", replace: true });
      }
      throw redirect({ to: "/onboarding", replace: true });
    }
  },
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email.");
      return;
    }
    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: signErr } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: redirectTo },
      });
      if (signErr) {
        setError(signErr.message);
        return;
      }
      void navigate({ to: "/check-email", replace: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <HostedAuthPageChrome title="Caqli">
      <p className="text-base leading-relaxed text-[#9CA3AF]">
        Build with agents in a focused workspace. Enter your email—we&apos;ll send a magic link.
        Works for new and returning accounts.
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-medium tracking-wide text-[#9CA3AF] uppercase">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="w-full rounded border border-[#333333] bg-black px-3 py-2.5 text-white outline-none focus:border-white"
            placeholder="you@company.com"
          />
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded border border-[#333333] bg-[#2B2B2B] px-4 py-3 text-sm font-medium text-white hover:bg-[#3D3D3D] disabled:opacity-50"
        >
          {busy ? "Sending…" : "Continue"}
        </button>
      </form>
    </HostedAuthPageChrome>
  );
}
