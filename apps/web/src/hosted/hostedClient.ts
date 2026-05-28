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

async function hostedFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(resolvePrimaryEnvironmentHttpUrl(path), {
    credentials: "include",
    ...init,
  });
}

/** Current **User** session on the **Hosted tier** control plane. */
export async function getHostedSession(): Promise<HostedSessionResponse> {
  const response = await hostedFetch("/api/hosted/session");
  return readJson(response);
}

export async function getHostedSignedInEmail(): Promise<string | undefined> {
  const session = await getHostedSession();
  return session.authenticated ? session.user?.email : undefined;
}

export async function hasHostedControlPlaneSession(): Promise<boolean> {
  const session = await getHostedSession();
  return session.authenticated;
}

export async function checkHostedAccessOnServer(email: string): Promise<HostedAccessDecision> {
  const response = await hostedFetch("/api/hosted/access/check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return readJson(response);
}

export async function requestHostedMagicLink(input: {
  readonly email: string;
  readonly redirectTo: string;
}): Promise<{ ok: true; devMagicLink?: string }> {
  const response = await hostedFetch("/api/hosted/auth/magic-link", {
    method: "POST",
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
  const response = await hostedFetch(
    `/api/hosted/auth/callback?token=${encodeURIComponent(token)}`,
  );
  return readJson(response);
}

export async function createHostedProjectOnServer(name: string): Promise<HostedApiProject> {
  const response = await hostedFetch("/api/hosted/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const body = await readJson<{ project: HostedApiProject }>(response);
  return body.project;
}

export async function listHostedProjectsOnServer(): Promise<ReadonlyArray<HostedApiProject>> {
  const response = await hostedFetch("/api/hosted/projects");
  const body = await readJson<{ projects: ReadonlyArray<HostedApiProject> }>(response);
  return body.projects;
}
