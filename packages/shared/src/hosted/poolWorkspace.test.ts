import { describe, expect, it } from "vitest";

import { provisionWorkspacePath } from "./poolWorkspace";

describe("provisionWorkspacePath", () => {
  it("builds a scoped pool path", () => {
    expect(provisionWorkspacePath("user-1", "proj-2")).toBe("pool/user-1/proj-2");
  });

  it("trims user and project ids", () => {
    expect(provisionWorkspacePath("  user-1  ", "  proj-2  ")).toBe("pool/user-1/proj-2");
  });

  it("rejects empty ids", () => {
    expect(() => provisionWorkspacePath("", "proj")).toThrow(/required/);
    expect(() => provisionWorkspacePath("user", "   ")).toThrow(/required/);
  });
});
