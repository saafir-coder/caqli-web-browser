import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo } from "react";

import { HostedAuthPageChrome } from "../hosted/HostedAuthPageChrome";
import { isHostedAuthConfigured, isHostedControlPlaneConfigured } from "../hosted/config";
import {
  HOSTED_DEV_MAGIC_LINK_KEY,
  HOSTED_PENDING_EMAIL_KEY,
} from "../hosted/onboardingUi";

export const Route = createFileRoute("/check-email")({
  beforeLoad: async () => {
    if (!isHostedAuthConfigured()) {
      throw redirect({ to: "/pair", replace: true });
    }
  },
  component: CheckEmailPage,
});

function CheckEmailPage() {
  const devMagicLink = useMemo(() => {
    if (!import.meta.env.DEV || !isHostedControlPlaneConfigured()) {
      return null;
    }
    return sessionStorage.getItem(HOSTED_DEV_MAGIC_LINK_KEY);
  }, []);

  const pendingEmail = useMemo(() => {
    try {
      return sessionStorage.getItem(HOSTED_PENDING_EMAIL_KEY)?.trim() || "your email";
    } catch {
      return "your email";
    }
  }, []);

  if (devMagicLink) {
    return (
      <HostedAuthPageChrome title="Local dev sign-in">
        <p className="text-base leading-relaxed text-[#9CA3AF]">
          No email is sent in local dev. Open this link to finish signing in:
        </p>
        <a
          href={devMagicLink}
          className="mt-3 block break-all text-sm text-white underline decoration-[#333333] underline-offset-4 hover:decoration-white"
        >
          {devMagicLink}
        </a>
        <p className="mt-4">
          <Link
            to="/welcome"
            className="text-sm font-medium text-white underline decoration-[#333333] underline-offset-4 hover:decoration-white"
          >
            Use a different email
          </Link>
        </p>
      </HostedAuthPageChrome>
    );
  }

  return (
    <HostedAuthPageChrome title="Check your inbox">
      <p className="text-base leading-relaxed">
        We sent a link to <span className="font-medium text-white">{pendingEmail}</span>. Open it on
        this device to continue. If you don&apos;t see it, check spam or wait a minute and try
        again.
      </p>
      <p>
        <Link
          to="/welcome"
          className="text-sm font-medium text-white underline decoration-[#333333] underline-offset-4 hover:decoration-white"
        >
          Use a different email
        </Link>
      </p>
    </HostedAuthPageChrome>
  );
}
