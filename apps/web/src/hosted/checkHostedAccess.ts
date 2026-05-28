import {
  decideHostedAccess,
  isHostedAccessEnforced,
  readHostedAllowlistFromEnv,
  resolveHostedAccessMode,
  type HostedAccessDenyReason,
} from "./accessAllowlist";

export type HostedAccessCheckResult = { ok: true } | { ok: false; userMessage: string };

function userMessageForDenyReason(reason: HostedAccessDenyReason | undefined): string {
  if (reason === "not_on_allowlist") {
    return "This email isn't on the Caqli dogfood access list yet. Ask your operator to add you, then try again.";
  }
  return "Caqli is invite-only during dogfood. Sign in with an approved email.";
}

function checkHostedEmailAccess(email: string): HostedAccessCheckResult {
  if (!isHostedAccessEnforced()) {
    return { ok: true };
  }

  const mode = resolveHostedAccessMode();
  const allowlist = readHostedAllowlistFromEnv();
  const decision = decideHostedAccess(email, allowlist, mode);
  if (decision.allowed) {
    return { ok: true };
  }
  return { ok: false, userMessage: userMessageForDenyReason(decision.reason) };
}

export function assertEmailMayRequestMagicLink(email: string): HostedAccessCheckResult {
  return checkHostedEmailAccess(email);
}

export function assertSessionMayEnterApp(email: string | undefined): HostedAccessCheckResult {
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
