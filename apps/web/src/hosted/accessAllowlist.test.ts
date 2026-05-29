import { afterEach, describe, expect, it, vi } from "vitest";

import { readHostedAllowlistFromEnv, resolveHostedAccessMode } from "./accessAllowlist";

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
