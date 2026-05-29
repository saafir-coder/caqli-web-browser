import { describe, expect, it } from "vitest";

import { resolveHostedSessionCookieSecure } from "./sessionCookieSecure.ts";

describe("resolveHostedSessionCookieSecure", () => {
  it("prefers x-forwarded-proto when present", () => {
    expect(
      resolveHostedSessionCookieSecure({
        requestUrl: new URL("http://127.0.0.1:5733/api/hosted/auth/callback"),
        publicOrigin: undefined,
        forwardedProto: "https",
      }),
    ).toBe(true);
    expect(
      resolveHostedSessionCookieSecure({
        requestUrl: new URL("https://app.example/api/hosted/auth/callback"),
        publicOrigin: undefined,
        forwardedProto: "http",
      }),
    ).toBe(false);
  });

  it("uses request URL protocol when forwarded header is absent", () => {
    expect(
      resolveHostedSessionCookieSecure({
        requestUrl: new URL("https://app.example/api/hosted/auth/callback"),
        publicOrigin: undefined,
        forwardedProto: undefined,
      }),
    ).toBe(true);
  });

  it("falls back to hosted publicOrigin behind a TLS-terminating proxy", () => {
    expect(
      resolveHostedSessionCookieSecure({
        requestUrl: new URL("http://127.0.0.1:8787/api/hosted/auth/callback"),
        publicOrigin: "https://app.caqli.example",
        forwardedProto: undefined,
      }),
    ).toBe(true);
  });
});
