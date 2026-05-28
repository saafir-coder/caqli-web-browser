import { afterEach, describe, expect, it, vi } from "vitest";

import { resolvePrimaryEnvironmentHttpUrl } from "./target";

function installBrowser(url: string) {
  vi.stubGlobal("window", {
    location: new URL(url),
  });
}

describe("resolvePrimaryEnvironmentHttpUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses searchParams for magic-link callback (not pathname query)", () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_HTTP_URL", "http://localhost:13773");
    vi.stubEnv("VITE_WS_URL", "ws://127.0.0.1:13773");
    installBrowser("http://localhost:5733/auth/callback");

    const url = resolvePrimaryEnvironmentHttpUrl("/api/hosted/auth/callback", {
      token: "abc+def",
    });

    expect(url).toBe("http://localhost:5733/api/hosted/auth/callback?token=abc%2Bdef");
  });

  it("keeps API on the current loopback origin when host is 127.0.0.1", () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_HTTP_URL", "http://localhost:13773");
    vi.stubEnv("VITE_DEV_SERVER_URL", "http://localhost:5733");
    installBrowser("http://127.0.0.1:5733/auth/callback");

    const url = resolvePrimaryEnvironmentHttpUrl("/api/hosted/session");

    expect(url).toBe("http://127.0.0.1:5733/api/hosted/session");
  });
});
