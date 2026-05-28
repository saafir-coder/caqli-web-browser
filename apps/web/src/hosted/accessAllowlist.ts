import {
  decideHostedAccess,
  normalizeHostedEmail,
  parseAllowlistEmails,
  type HostedAccessDecision,
  type HostedAccessDenyReason,
  type HostedAccessMode,
} from "@t3tools/shared/hosted/accessAllowlist";

import { isHostedAuthConfigured, isHostedControlPlaneConfigured } from "./config";

export {
  decideHostedAccess,
  normalizeHostedEmail,
  parseAllowlistEmails,
  type HostedAccessDecision,
  type HostedAccessDenyReason,
  type HostedAccessMode,
};

export function resolveHostedAccessMode(): HostedAccessMode {
  const raw = import.meta.env.VITE_HOSTED_ACCESS_MODE?.trim().toLowerCase() ?? "";
  if (raw === "open") {
    return "open";
  }
  if (raw === "invite") {
    return "invite";
  }
  if (isHostedAuthConfigured()) {
    return "invite";
  }
  return "open";
}

export function readHostedAllowlistFromEnv(): Set<string> {
  return parseAllowlistEmails(import.meta.env.VITE_HOSTED_ALLOWLIST_EMAILS);
}

export function isHostedAccessEnforced(): boolean {
  if (!isHostedAuthConfigured()) {
    return false;
  }
  if (isHostedControlPlaneConfigured()) {
    const raw = import.meta.env.VITE_HOSTED_ACCESS_MODE?.trim().toLowerCase() ?? "invite";
    return raw !== "open";
  }
  return resolveHostedAccessMode() === "invite";
}
