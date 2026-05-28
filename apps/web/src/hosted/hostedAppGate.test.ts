import { afterEach, describe, expect, it, vi } from "vitest";

import * as checkHostedAccess from "./checkHostedAccess";
import * as hostedClient from "./hostedClient";
import { resolveHostedChatRedirect, resolveHostedWelcomeRedirect } from "./hostedAppGate";
import * as hostedCodexConnection from "./hostedCodexConnection";
import * as onboardingStorage from "./onboardingStorage";

vi.mock("./config", () => ({
  isHostedAuthConfigured: () => true,
  isHostedControlPlaneConfigured: () => true,
  isSupabaseHostedAuthConfigured: () => false,
}));

describe("hostedAppGate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolveHostedWelcomeRedirect sends completed profile to app home", async () => {
    vi.spyOn(hostedClient, "getHostedSession").mockResolvedValue({
      authenticated: true,
      user: { id: "u1", email: "a@b.com", createdAt: "2026-01-01T00:00:00.000Z" },
    });
    vi.spyOn(onboardingStorage, "readHostedProfileComplete").mockReturnValue(true);

    await expect(resolveHostedWelcomeRedirect()).resolves.toEqual({
      to: "/",
      replace: true,
    });
  });

  it("resolveHostedChatRedirect requires onboarding when profile incomplete", async () => {
    vi.spyOn(hostedClient, "getHostedSession").mockResolvedValue({
      authenticated: true,
      user: { id: "u1", email: "a@b.com", createdAt: "2026-01-01T00:00:00.000Z" },
    });
    vi.spyOn(checkHostedAccess, "assertSessionMayEnterApp").mockResolvedValue({ ok: true });
    vi.spyOn(onboardingStorage, "readHostedProfileComplete").mockReturnValue(false);

    await expect(resolveHostedChatRedirect()).resolves.toEqual({
      to: "/onboarding",
      replace: true,
    });
  });

  it("resolveHostedChatRedirect requires connect-provider when codex not connected", async () => {
    vi.spyOn(hostedClient, "getHostedSession").mockResolvedValue({
      authenticated: true,
      user: { id: "u1", email: "a@b.com", createdAt: "2026-01-01T00:00:00.000Z" },
    });
    vi.spyOn(checkHostedAccess, "assertSessionMayEnterApp").mockResolvedValue({ ok: true });
    vi.spyOn(onboardingStorage, "readHostedProfileComplete").mockReturnValue(true);
    vi.spyOn(hostedCodexConnection, "readHostedCodexConnected").mockReturnValue(false);

    await expect(resolveHostedChatRedirect()).resolves.toEqual({
      to: "/connect-provider",
      replace: true,
    });
  });
});
