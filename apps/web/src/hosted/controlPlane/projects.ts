import type { SupabaseClient } from "@supabase/supabase-js";

import { provisionWorkspacePath } from "./poolWorkspace";
import type { HostedProject } from "./types";

const PENDING_QUEUE_KEY = "caqli.hostedProjectPendingQueue";

export const HOSTED_ACTIVE_PROJECT_ID_KEY = "caqli.hostedActiveProjectId";

type HostedProjectRow = {
  id: string;
  user_id: string;
  name: string;
  workspace_path: string;
  created_at: string;
};

interface PendingHostedProjectCreate {
  readonly userId: string;
  readonly name: string;
  readonly project: HostedProject;
  readonly queuedAt: string;
}

function toHostedProject(row: HostedProjectRow): HostedProject {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    workspace_path: row.workspace_path,
    created_at: row.created_at,
  };
}

function readPendingQueue(): PendingHostedProjectCreate[] {
  try {
    const raw = globalThis.localStorage?.getItem(PENDING_QUEUE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingHostedProjectCreate[]) : [];
  } catch {
    return [];
  }
}

function writePendingQueue(entries: PendingHostedProjectCreate[]): void {
  try {
    globalThis.localStorage?.setItem(PENDING_QUEUE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

function enqueuePendingProject(entry: PendingHostedProjectCreate, cause: unknown): void {
  const queue = readPendingQueue();
  const withoutDup = queue.filter((item) => item.project.id !== entry.project.id);
  writePendingQueue([...withoutDup, entry]);
  console.warn(
    "[hosted control plane] Could not persist project to Supabase; queued for dev retry.",
    cause,
  );
}

async function findHostedProjectByName(
  supabase: SupabaseClient,
  userId: string,
  name: string,
): Promise<HostedProject | null> {
  const { data, error } = await supabase
    .from("hosted_projects")
    .select("id, user_id, name, workspace_path, created_at")
    .eq("user_id", userId)
    .eq("name", name)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toHostedProject(data as HostedProjectRow) : null;
}

async function findHostedProjectByWorkspacePath(
  supabase: SupabaseClient,
  workspacePath: string,
): Promise<HostedProject | null> {
  const { data, error } = await supabase
    .from("hosted_projects")
    .select("id, user_id, name, workspace_path, created_at")
    .eq("workspace_path", workspacePath)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toHostedProject(data as HostedProjectRow) : null;
}

export async function listHostedProjects(
  supabase: SupabaseClient,
  userId: string,
): Promise<HostedProject[]> {
  const { data, error } = await supabase
    .from("hosted_projects")
    .select("id, user_id, name, workspace_path, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => toHostedProject(row as HostedProjectRow));
}

/**
 * Creates a hosted project and pool workspace mapping. Idempotent when the same
 * user submits the same trimmed name again (returns the existing row).
 */
export async function createHostedProject(
  supabase: SupabaseClient,
  userId: string,
  name: string,
): Promise<HostedProject> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Project name is required.");
  }

  const existingByName = await findHostedProjectByName(supabase, userId, trimmed);
  if (existingByName) {
    return existingByName;
  }

  const projectId = crypto.randomUUID();
  const workspacePath = provisionWorkspacePath(userId, projectId);
  const optimistic: HostedProject = {
    id: projectId,
    user_id: userId,
    name: trimmed,
    workspace_path: workspacePath,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("hosted_projects")
    .insert({
      id: projectId,
      user_id: userId,
      name: trimmed,
      workspace_path: workspacePath,
    })
    .select("id, user_id, name, workspace_path, created_at")
    .single();

  if (!error && data) {
    return toHostedProject(data as HostedProjectRow);
  }

  if (error?.code === "23505") {
    const raced = await findHostedProjectByWorkspacePath(supabase, workspacePath);
    if (raced) {
      return raced;
    }
    const byName = await findHostedProjectByName(supabase, userId, trimmed);
    if (byName) {
      return byName;
    }
  }

  enqueuePendingProject(
    {
      userId,
      name: trimmed,
      project: optimistic,
      queuedAt: new Date().toISOString(),
    },
    error,
  );

  if (import.meta.env.DEV) {
    return optimistic;
  }

  throw new Error(
    error?.message ?? "Could not create your project. Check your connection and try again.",
  );
}
