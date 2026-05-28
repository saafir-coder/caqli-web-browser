import { describe, expect, it } from "vitest";

import { provisionWorkspacePath } from "./poolWorkspace";

describe("provisionWorkspacePath", () => {
  const userId = "11111111-1111-4111-8111-111111111111";
  const projectId = "22222222-2222-4222-8222-222222222222";

  it("returns pool/{userId}/{projectId}", () => {
    expect(provisionWorkspacePath(userId, projectId)).toBe(`pool/${userId}/${projectId}`);
  });

  it("is idempotent for the same inputs", () => {
    const first = provisionWorkspacePath(userId, projectId);
    const second = provisionWorkspacePath(userId, projectId);
    expect(first).toBe(second);
  });

  it("scopes paths per user and project", () => {
    const otherUser = "33333333-3333-4333-8333-333333333333";
    const pathA = provisionWorkspacePath(userId, projectId);
    const pathB = provisionWorkspacePath(otherUser, projectId);
    expect(pathA).not.toBe(pathB);
    expect(pathA.startsWith(`pool/${userId}/`)).toBe(true);
    expect(pathB.startsWith(`pool/${otherUser}/`)).toBe(true);
  });

  it("rejects empty identifiers", () => {
    expect(() => provisionWorkspacePath("", projectId)).toThrow(/required/i);
    expect(() => provisionWorkspacePath(userId, "  ")).toThrow(/required/i);
  });
});
