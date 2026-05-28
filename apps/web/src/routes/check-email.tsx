import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { HostedAuthPageChrome } from "../hosted/HostedAuthPageChrome";
import { isHostedAuthConfigured } from "../hosted/config";

export const Route = createFileRoute("/check-email")({
  beforeLoad: async () => {
    if (!isHostedAuthConfigured()) {
      throw redirect({ to: "/pair", replace: true });
    }
  },
  component: CheckEmailPage,
});

function CheckEmailPage() {
  return (
    <HostedAuthPageChrome title="Check your inbox">
      <p className="text-base leading-relaxed">
        We sent a link to your email. Open it on this device to continue. If you don&apos;t see it,
        check spam or wait a minute and try again.
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
