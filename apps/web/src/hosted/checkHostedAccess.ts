import {
  decideHostedAccess,
  isHostedAccessEnforced,
  readHostedAllowlistFromEnv,
  resolveHostedAccessMode,
  type HostedAccessDenyReason,
} from "./accessAllowlist";
import { checkHostedAccessOnServer } from "./hostedClient";
import { isHostedControlPlaneConfigured } from "./config";

export type HostedAccessCheckResult = { ok: true } | { ok: false; userMessage: string };

function userMessageForDenyReason(reason: HostedAccessDenyReason | undefined): string {
  if (reason === "not_on_allowlist") {
    return "This email isn't on the Caqli dogfood access list yet. Ask your operator to add you, then try again.";
  }
  return "Caqli is invite-only during dogfood. Sign in with an approved email.";
}

async function checkHostedEmailAccess(email: string): Promise<HostedAccessCheckResult> {
  if (!isHostedAccessEnforced()) {
    return { ok: true };
  }

  if (isHostedControlPlaneConfigured()) {
    try {
      const decision = await checkHostedAccessOnServer(email);
      if (decision.allowed) {
        return { ok: true };
      }
      return { ok: false, userMessage: userMessageForDenyReason(decision.reason) };
    } catch {
      return {
        ok: false,
        userMessage: "Could not verify access. Check your connection and try again.",
      };
    }
  }

  const mode = resolveHostedAccessMode();
  const allowlist = readHostedAllowlistFromEnv();
  const decision = decideHostedAccess(email, allowlist, mode);
  if (decision.allowed) {
    return { ok: true };
  }
  return { ok: false, userMessage: userMessageForDenyReason(decision.reason) };
}

export async function assertEmailMayRequestMagicLink(
  email: string,
): Promise<HostedAccessCheckResult> {
  return checkHostedEmailAccess(email);
}

export async function assertSessionMayEnterApp(
  email: string | undefined,
): Promise<HostedAccessCheckResult> {
  if (!isHostedAccessEnforced()) {
    return { ok: true };
  }
  if (!email?.trim()) {
    return {
      ok: false,
      userMessage: userMessageForDenyReason("invite_only"),
    };
  }
  return checkHostedEmailAccess(email);
}
