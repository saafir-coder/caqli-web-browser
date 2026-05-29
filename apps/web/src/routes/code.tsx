import { createFileRoute, redirect } from "@tanstack/react-router";

import { isHostedAuthConfigured } from "../hosted/config";
import { resolveHostedChatRedirect } from "../hosted/hostedAppGate";
import { HostedWorkspaceCodePage } from "../hosted/workspace/HostedWorkspaceCodePage";

export const Route = createFileRoute("/code")({
  beforeLoad: async ({ context }) => {
    if (context.authGateState.status !== "authenticated") {
      throw redirect({
        to: isHostedAuthConfigured() ? "/welcome" : "/pair",
        replace: true,
      });
    }

    const hostedRedirect = await resolveHostedChatRedirect();
    if (hostedRedirect) {
      throw redirect(hostedRedirect);
    }
  },
  component: HostedWorkspaceCodePage,
});
