import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isHostedAuthConfigured,
  isHostedControlPlaneConfigured,
} from "./config";

describe("hosted config detection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not enable hosted auth for default dev-runner env (HTTP_URL only)", () => {
    vi.stubEnv("VITE_HTTP_URL", "http://localhost:13773");
    vi.stubEnv("VITE_WS_URL", "ws://localhost:13773");
    vi.stubEnv("VITE_API_URL", "");
    vi.stubEnv("VITE_HOSTED_ACCESS_MODE", "");
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");

    expect(isHostedControlPlaneConfigured()).toBe(false);
    expect(isHostedAuthConfigured()).toBe(false);
  });

  it("enables hosted control plane when VITE_API_URL is set", () => {
    vi.stubEnv("VITE_API_URL", "http://localhost:13773");
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");

    expect(isHostedControlPlaneConfigured()).toBe(true);
    expect(isHostedAuthConfigured()).toBe(true);
  });

  it("enables hosted control plane when access mode is set with HTTP_URL", () => {
    vi.stubEnv("VITE_HTTP_URL", "http://localhost:13773");
    vi.stubEnv("VITE_HOSTED_ACCESS_MODE", "invite");
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");

    expect(isHostedControlPlaneConfigured()).toBe(true);
    expect(isHostedAuthConfigured()).toBe(true);
  });
});
