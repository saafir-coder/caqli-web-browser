import { describe, expect, it } from "@effect/vitest";

import { resolveMagicLinkAllowedOrigins, validateMagicLinkRedirectTo } from "./magicLinkRedirect";

describe("magicLinkRedirect", () => {
  it("allows redirects whose origin is configured", () => {
    const allowed = resolveMagicLinkAllowedOrigins({
      devUrl: new URL("http://127.0.0.1:5733"),
      port: 3773,
      host: "127.0.0.1",
      publicOrigin: "https://app.caqli.example",
    });

    expect(
      validateMagicLinkRedirectTo("https://app.caqli.example/auth/callback", allowed, false),
    ).toEqual({
      ok: true,
      redirectTo: "https://app.caqli.example/auth/callback",
    });
    expect(
      validateMagicLinkRedirectTo("http://127.0.0.1:5733/auth/callback", allowed, false),
    ).toEqual({
      ok: true,
      redirectTo: "http://127.0.0.1:5733/auth/callback",
    });
  });

  it("rejects external origins unless loopback dev mode is enabled", () => {
    const allowed = resolveMagicLinkAllowedOrigins({
      devUrl: undefined,
      port: 3773,
      host: "127.0.0.1",
      publicOrigin: "https://app.caqli.example",
    });

    expect(validateMagicLinkRedirectTo("https://evil.example/capture", allowed, false)).toEqual({
      ok: false,
      message: "Magic link redirect origin is not allowed.",
    });

    expect(
      validateMagicLinkRedirectTo("http://localhost:5733/auth/callback", allowed, true),
    ).toEqual({
      ok: true,
      redirectTo: "http://localhost:5733/auth/callback",
    });
  });

  it("rejects malformed redirect URLs", () => {
    const allowed = resolveMagicLinkAllowedOrigins({
      devUrl: undefined,
      port: 3773,
      host: undefined,
      publicOrigin: undefined,
    });

    expect(validateMagicLinkRedirectTo("not-a-url", allowed, true)).toEqual({
      ok: false,
      message: "Invalid magic link redirect URL.",
    });
    expect(validateMagicLinkRedirectTo("javascript:alert(1)", allowed, true)).toEqual({
      ok: false,
      message: "Magic link redirect must use http or https.",
    });
  });
});
