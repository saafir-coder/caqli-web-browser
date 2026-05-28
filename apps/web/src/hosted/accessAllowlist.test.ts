import { afterEach, describe, expect, it, vi } from "vitest";

import {
  decideHostedAccess,
  normalizeHostedEmail,
  parseAllowlistEmails,
  readHostedAllowlistFromEnv,
  resolveHostedAccessMode,
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

  it("allows any email when mode is open", () => {
    expect(decideHostedAccess("stranger@example.com", allowlist, "open")).toEqual({
      allowed: true,
    });
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

describe("resolveHostedAccessMode", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("respects VITE_HOSTED_ACCESS_MODE when set", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("VITE_HOSTED_ACCESS_MODE", "open");
    expect(resolveHostedAccessMode()).toBe("open");

    vi.stubEnv("VITE_HOSTED_ACCESS_MODE", "invite");
    expect(resolveHostedAccessMode()).toBe("invite");
  });

  it("defaults to invite when hosted auth is configured and mode unset", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("VITE_HOSTED_ACCESS_MODE", "");
    expect(resolveHostedAccessMode()).toBe("invite");
  });

  it("defaults to open when hosted auth is not configured", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
    vi.stubEnv("VITE_HOSTED_ACCESS_MODE", "");
    expect(resolveHostedAccessMode()).toBe("open");
  });
});

describe("readHostedAllowlistFromEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads comma-separated allowlist from env", () => {
    vi.stubEnv("VITE_HOSTED_ALLOWLIST_EMAILS", "a@x.com, B@X.com");
    expect(readHostedAllowlistFromEnv()).toEqual(new Set(["a@x.com", "b@x.com"]));
  });
});
