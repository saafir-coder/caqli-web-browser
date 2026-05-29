/**
 * Deterministic pool workspace path for a hosted project (1:1 project ↔ workspace).
 * Format: `pool/{userId}/{projectId}` — scoped per user, no cross-tenant paths.
 */
export function provisionWorkspacePath(userId: string, projectId: string): string {
  const user = userId.trim();
  const project = projectId.trim();
  if (!user || !project) {
    throw new Error("userId and projectId are required to provision a workspace path.");
  }
  return `pool/${user}/${project}`;
}
