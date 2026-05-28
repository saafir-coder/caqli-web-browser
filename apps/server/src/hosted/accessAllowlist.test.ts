import { describe, expect, it } from "vitest";

import { decideHostedAccess, parseAllowlistEmails } from "./accessAllowlist";

describe("hosted accessAllowlist", () => {
  it("allows any email in open mode", () => {
    expect(decideHostedAccess("a@b.com", new Set(), "open")).toEqual({ allowed: true });
  });

  it("denies unknown emails in invite mode", () => {
    const allowlist = parseAllowlistEmails("ops@caqli.test");
    expect(decideHostedAccess("other@b.com", allowlist, "invite")).toEqual({
      allowed: false,
      reason: "not_on_allowlist",
    });
    expect(decideHostedAccess("ops@caqli.test", allowlist, "invite")).toEqual({ allowed: true });
  });
});
