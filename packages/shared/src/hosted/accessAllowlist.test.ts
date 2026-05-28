import { describe, expect, it } from "vitest";

import {
  decideHostedAccess,
  normalizeHostedEmail,
  parseAllowlistEmails,
} from "./accessAllowlist";

describe("normalizeHostedEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeHostedEmail("  User@Example.COM ")).toBe("user@example.com");
  });
});

describe("parseAllowlistEmails", () => {
  it("returns empty set for undefined or blank input", () => {
    expect(parseAllowlistEmails(undefined).size).toBe(0);
    expect(parseAllowlistEmails("  , , ").size).toBe(0);
  });

  it("parses comma-separated emails with normalization", () => {
    const set = parseAllowlistEmails("alice@co.com, Bob@Co.com ,");
    expect(set).toEqual(new Set(["alice@co.com", "bob@co.com"]));
  });
});

describe("decideHostedAccess", () => {
  const allowlist = new Set(["approved@example.com"]);

  it("allows any email in open mode", () => {
    expect(decideHostedAccess("a@b.com", new Set(), "open")).toEqual({ allowed: true });
  });

  it("allows allowlisted email in invite mode", () => {
    expect(decideHostedAccess("approved@example.com", allowlist, "invite")).toEqual({
      allowed: true,
    });
    expect(decideHostedAccess("  Approved@Example.com ", allowlist, "invite")).toEqual({
      allowed: true,
    });
  });

  it("denies non-allowlisted email in invite mode", () => {
    expect(decideHostedAccess("other@example.com", allowlist, "invite")).toEqual({
      allowed: false,
      reason: "not_on_allowlist",
    });
  });

  it("denies blank email in invite mode", () => {
    expect(decideHostedAccess("   ", allowlist, "invite")).toEqual({
      allowed: false,
      reason: "invite_only",
    });
  });

  it("denies when allowlist is empty in invite mode", () => {
    expect(decideHostedAccess("user@example.com", new Set(), "invite")).toEqual({
      allowed: false,
      reason: "not_on_allowlist",
    });
  });
});
