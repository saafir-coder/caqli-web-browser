export function resolveHostedSessionCookieSecure(input: {
  readonly requestUrl: URL;
  readonly publicOrigin: string | undefined;
  readonly forwardedProto: string | undefined;
}): boolean {
  const forwarded = input.forwardedProto?.split(",")[0]?.trim().toLowerCase();
  if (forwarded === "https") {
    return true;
  }
  if (forwarded === "http") {
    return false;
  }
  if (input.requestUrl.protocol === "https:") {
    return true;
  }
  const publicOrigin = input.publicOrigin?.trim();
  if (publicOrigin) {
    try {
      return new URL(publicOrigin).protocol === "https:";
    } catch {
      return false;
    }
  }
  return false;
}

export function readForwardedProtoHeader(
  headers: Readonly<Record<string, string | ReadonlyArray<string> | undefined>>,
): string | undefined {
  const header = headers["x-forwarded-proto"];
  if (typeof header === "string") {
    return header;
  }
  if (Array.isArray(header)) {
    const first = header[0];
    return typeof first === "string" ? first : undefined;
  }
  return undefined;
}
