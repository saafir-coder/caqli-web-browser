import { scopeThreadRef } from "@t3tools/client-runtime";
import { describe, expect, it } from "vitest";

import { resolveActiveThread, resolveRouteThreadRefFromParams } from "./activeThreadContext";

describe("activeThreadContext", () => {
  it("resolves draft route thread ref from draft session", () => {
    const ref = resolveRouteThreadRefFromParams(
      { draftId: "draft-1" },
      {
        threadId: "thread-1" as never,
        environmentId: "env-1" as never,
        projectId: "proj-1" as never,
        logicalProjectKey: "key",
        createdAt: "2026-01-01",
        runtimeMode: "auto-accept-edits",
        interactionMode: "default",
        branch: null,
        worktreePath: null,
        envMode: "worktree",
      },
    );
    expect(ref).toEqual(scopeThreadRef("env-1" as never, "thread-1" as never));
  });

  it("uses server thread on server routes when present", () => {
    const routeThreadRef = scopeThreadRef("env-1" as never, "thread-1" as never);
    const serverThread = {
      id: "thread-1" as never,
      environmentId: "env-1" as never,
    } as never;

    const resolved = resolveActiveThread({
      routeThreadRef,
      routeKind: "server",
      serverThread,
      draftThread: null,
    });

    expect(resolved.isServerThread).toBe(true);
    expect(resolved.activeThread).toBe(serverThread);
  });
});
