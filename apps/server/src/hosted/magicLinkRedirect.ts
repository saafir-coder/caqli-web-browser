import { isLoopbackHostname } from "../http.ts";

export function resolveMagicLinkAllowedOrigins(input: {
  readonly devUrl: URL | undefined;
  readonly port: number;
  readonly host: string | undefined;
  readonly publicOrigin: string | undefined;
}): ReadonlySet<string> {
  const origins = new Set<string>();
  const publicOrigin = input.publicOrigin?.trim();
  if (publicOrigin) {
    try {
      origins.add(new URL(publicOrigin).origin);
    } catch {
      // ignore invalid configured origin
    }
  }
  if (input.devUrl) {
    origins.add(input.devUrl.origin);
  }
  const host = input.host ?? "127.0.0.1";
  for (const hostname of [host, "127.0.0.1", "localhost"]) {
    origins.add(`http://${hostname}:${input.port}`);
    origins.add(`https://${hostname}:${input.port}`);
  }
  return origins;
}

export type MagicLinkRedirectValidation =
  | { readonly ok: true; readonly redirectTo: string }
  | { readonly ok: false; readonly message: string };

export function validateMagicLinkRedirectTo(
  redirectTo: string,
  allowedOrigins: ReadonlySet<string>,
  allowLoopbackOrigins: boolean,
): MagicLinkRedirectValidation {
  let redirectUrl: URL;
  try {
    redirectUrl = new URL(redirectTo);
  } catch {
    return { ok: false, message: "Invalid magic link redirect URL." };
  }

  if (redirectUrl.protocol !== "http:" && redirectUrl.protocol !== "https:") {
    return { ok: false, message: "Magic link redirect must use http or https." };
  }

  if (allowedOrigins.has(redirectUrl.origin)) {
    return { ok: true, redirectTo };
  }

  if (allowLoopbackOrigins && isLoopbackHostname(redirectUrl.hostname)) {
    return { ok: true, redirectTo };
  }

  return { ok: false, message: "Magic link redirect origin is not allowed." };
}
