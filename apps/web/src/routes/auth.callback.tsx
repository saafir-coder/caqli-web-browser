import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { completeHostedMagicLinkCallback } from "../hosted/apiClient";
import { assertSessionMayEnterApp } from "../hosted/checkHostedAccess";
import { HostedAuthPageChrome } from "../hosted/HostedAuthPageChrome";
import { readHostedProfileComplete } from "../hosted/onboardingStorage";
import { isHostedAuthConfigured, isHostedControlPlaneConfigured } from "../hosted/config";
import { getSupabaseBrowserClient } from "../hosted/supabaseClient";

export const Route = createFileRoute("/auth/callback")({
  beforeLoad: async () => {
    if (!isHostedAuthConfigured()) {
      throw redirect({ to: "/pair", replace: true });
    }
  },
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const run = async () => {
      try {
        if (isHostedControlPlaneConfigured()) {
          const token = new URL(window.location.href).searchParams.get("token");
          if (!token) {
            setMessage("Missing sign-in token. Request a new link from the welcome page.");
            return;
          }
          const result = await completeHostedMagicLinkCallback(token);
          const access = await assertSessionMayEnterApp(result.user.email);
          if (!access.ok) {
            setMessage(access.userMessage);
            return;
          }
          if (readHostedProfileComplete()) {
            void navigate({ to: "/", replace: true });
          } else {
            void navigate({ to: "/onboarding", replace: true });
          }
          return;
        }

        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          setMessage(error.message);
          return;
        }
        if (!session) {
          setMessage("No active session. Request a new link from the welcome page.");
          return;
        }
        const access = await assertSessionMayEnterApp(session.user.email);
        if (!access.ok) {
          await supabase.auth.signOut();
          setMessage(access.userMessage);
          return;
        }
        if (readHostedProfileComplete()) {
          void navigate({ to: "/", replace: true });
        } else {
          void navigate({ to: "/onboarding", replace: true });
        }
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Sign-in failed.");
      }
    };
    void run();
  }, [navigate]);

  return (
    <HostedAuthPageChrome title="Completing sign-in">
      <p>{message}</p>
    </HostedAuthPageChrome>
  );
}
