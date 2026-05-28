import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { HostedAuthPageChrome } from "../hosted/HostedAuthPageChrome";
import { isHostedAuthConfigured } from "../hosted/config";

export const Route = createFileRoute("/access-denied")({
  validateSearch: (search: Record<string, unknown>) => ({
    message: typeof search.message === "string" ? search.message : undefined,
  }),
  beforeLoad: async () => {
    if (!isHostedAuthConfigured()) {
      throw redirect({ to: "/pair", replace: true });
    }
  },
  component: AccessDeniedPage,
});

function AccessDeniedPage() {
  const { message } = Route.useSearch();
  const copy =
    message ??
    "You don't have access to this Caqli dogfood build yet. Ask your operator to add your email to the allowlist.";

  return (
    <HostedAuthPageChrome title="Access not available">
      <p className="text-base leading-relaxed">{copy}</p>
      <p>
        <Link
          to="/welcome"
          className="text-sm font-medium text-white underline decoration-[#333333] underline-offset-4 hover:decoration-white"
        >
          Try a different email
        </Link>
      </p>
    </HostedAuthPageChrome>
  );
}
