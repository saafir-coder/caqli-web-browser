import { listHostedProjectsOnServer, type HostedApiProject } from "./hostedClient";
import { isHostedControlPlaneConfigured } from "./config";

export const HOSTED_ACTIVE_PROJECT_ID_KEY = "caqli.hostedActiveProjectId";
export const HOSTED_ACTIVE_THREAD_ID_KEY = "caqli.hostedActiveThreadId";

export function readHostedActiveProjectId(): string | null {
  try {
    const value = globalThis.localStorage?.getItem(HOSTED_ACTIVE_PROJECT_ID_KEY)?.trim();
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export function writeHostedActiveProjectId(projectId: string): void {
  try {
    globalThis.localStorage?.setItem(HOSTED_ACTIVE_PROJECT_ID_KEY, projectId);
  } catch {
    /* ignore */
  }
}

export function readHostedActiveThreadId(): string | null {
  try {
    const value = globalThis.localStorage?.getItem(HOSTED_ACTIVE_THREAD_ID_KEY)?.trim();
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export function writeHostedActiveThreadId(threadId: string): void {
  try {
    globalThis.localStorage?.setItem(HOSTED_ACTIVE_THREAD_ID_KEY, threadId);
  } catch {
    /* ignore */
  }
}

function pickProjectBySessionResumeRules(
  projects: ReadonlyArray<HostedApiProject>,
  storedProjectId: string | null,
): HostedApiProject | null {
  if (projects.length === 0) {
    return null;
  }
  if (storedProjectId) {
    const match = projects.find((project) => project.id === storedProjectId);
    if (match) {
      return match;
    }
  }
  const sorted = [...projects].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
  return sorted[0] ?? null;
}

/**
 * Resolves the **User**'s active **Project** for **Session resume** and persists the id locally.
 * Uses control-plane project list when configured; otherwise returns the stored id only.
 */
export async function syncHostedActiveProjectForSessionResume(): Promise<string | null> {
  const storedProjectId = readHostedActiveProjectId();
  if (!isHostedControlPlaneConfigured()) {
    return storedProjectId;
  }

  try {
    const projects = await listHostedProjectsOnServer();
    const active = pickProjectBySessionResumeRules(projects, storedProjectId);
    if (!active) {
      return null;
    }
    writeHostedActiveProjectId(active.id);
    return active.id;
  } catch {
    return storedProjectId;
  }
}
