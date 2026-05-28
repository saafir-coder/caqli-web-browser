export type HostedAccessMode = "open" | "invite";

export type HostedAccessDenyReason = "not_on_allowlist" | "invite_only";

export type HostedAccessDecision = {
  readonly allowed: boolean;
  readonly reason?: HostedAccessDenyReason;
};

export function normalizeHostedEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function parseAllowlistEmails(raw: string | undefined): Set<string> {
  if (!raw?.trim()) {
    return new Set();
  }
  const emails = new Set<string>();
  for (const part of raw.split(",")) {
    const normalized = normalizeHostedEmail(part);
    if (normalized.length > 0) {
      emails.add(normalized);
    }
  }
  return emails;
}

export function decideHostedAccess(
  email: string,
  allowlist: ReadonlySet<string>,
  mode: HostedAccessMode,
): HostedAccessDecision {
  if (mode === "open") {
    return { allowed: true };
  }

  const normalized = normalizeHostedEmail(email);
  if (!normalized) {
    return { allowed: false, reason: "invite_only" };
  }
  if (!allowlist.has(normalized)) {
    return { allowed: false, reason: "not_on_allowlist" };
  }
  return { allowed: true };
}
