import { resolvePrimaryEnvironmentHttpUrl } from "../environments/primary/target";

export interface HostedApiUser {
  readonly id: string;
  readonly email: string;
  readonly createdAt: string;
}

export interface HostedApiProject {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly workspacePath: string;
  readonly createdAt: string;
}

export interface HostedSessionResponse {
  readonly authenticated: boolean;
  readonly user?: HostedApiUser;
}

export interface HostedAccessDecision {
  readonly allowed: boolean;
  readonly reason?: "not_on_allowlist" | "invite_only";
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${response.status}).`);
  }
  return (await response.json()) as T;
}

export async function fetchHostedSession(): Promise<HostedSessionResponse> {
  const response = await fetch(resolvePrimaryEnvironmentHttpUrl("/api/hosted/session"), {
    credentials: "include",
  });
  return readJson(response);
}

export async function checkHostedAccessOnServer(email: string): Promise<HostedAccessDecision> {
  const response = await fetch(resolvePrimaryEnvironmentHttpUrl("/api/hosted/access/check"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return readJson(response);
}

export async function requestHostedMagicLink(input: {
  readonly email: string;
  readonly redirectTo: string;
}): Promise<{ ok: true; devMagicLink?: string }> {
  const response = await fetch(resolvePrimaryEnvironmentHttpUrl("/api/hosted/auth/magic-link"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson(response);
}

export async function completeHostedMagicLinkCallback(token: string): Promise<{
  ok: true;
  user: HostedApiUser;
  expiresAt: string;
}> {
  const response = await fetch(
    resolvePrimaryEnvironmentHttpUrl("/api/hosted/auth/callback", { token }),
    { credentials: "include" },
  );
  return readJson(response);
}

export async function createHostedProjectOnServer(name: string): Promise<HostedApiProject> {
  const response = await fetch(resolvePrimaryEnvironmentHttpUrl("/api/hosted/projects"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const body = await readJson<{ project: HostedApiProject }>(response);
  return body.project;
}

export async function listHostedProjectsOnServer(): Promise<ReadonlyArray<HostedApiProject>> {
  const response = await fetch(resolvePrimaryEnvironmentHttpUrl("/api/hosted/projects"), {
    credentials: "include",
  });
  const body = await readJson<{ projects: ReadonlyArray<HostedApiProject> }>(response);
  return body.projects;
}
