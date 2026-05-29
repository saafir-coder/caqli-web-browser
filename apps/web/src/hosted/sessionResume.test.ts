import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as hostedClient from "./hostedClient";
import {
  HOSTED_ACTIVE_PROJECT_ID_KEY,
  readHostedActiveProjectId,
  syncHostedActiveProjectForSessionResume,
  writeHostedActiveProjectId,
} from "./sessionResume";

vi.mock("./config", () => ({
  isHostedControlPlaneConfigured: () => true,
}));

function createLocalStorageMock(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe("sessionResume", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createLocalStorageMock());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.localStorage?.removeItem(HOSTED_ACTIVE_PROJECT_ID_KEY);
  });

  it("persists and reads active project id", () => {
    writeHostedActiveProjectId("proj-a");
    expect(readHostedActiveProjectId()).toBe("proj-a");
  });

  it("syncHostedActiveProjectForSessionResume keeps stored id when listed", async () => {
    writeHostedActiveProjectId("proj-a");
    vi.spyOn(hostedClient, "listHostedProjectsOnServer").mockResolvedValue([
      {
        id: "proj-a",
        userId: "user-1",
        name: "Alpha",
        workspacePath: "pool/user-1/proj-a",
        createdAt: "2026-01-02T00:00:00.000Z",
      },
      {
        id: "proj-b",
        userId: "user-1",
        name: "Beta",
        workspacePath: "pool/user-1/proj-b",
        createdAt: "2026-01-03T00:00:00.000Z",
      },
    ]);

    await expect(syncHostedActiveProjectForSessionResume()).resolves.toBe("proj-a");
    expect(readHostedActiveProjectId()).toBe("proj-a");
  });

  it("syncHostedActiveProjectForSessionResume falls back to newest project", async () => {
    writeHostedActiveProjectId("missing");
    vi.spyOn(hostedClient, "listHostedProjectsOnServer").mockResolvedValue([
      {
        id: "proj-old",
        userId: "user-1",
        name: "Old",
        workspacePath: "pool/user-1/proj-old",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "proj-new",
        userId: "user-1",
        name: "New",
        workspacePath: "pool/user-1/proj-new",
        createdAt: "2026-01-05T00:00:00.000Z",
      },
    ]);

    await expect(syncHostedActiveProjectForSessionResume()).resolves.toBe("proj-new");
    expect(readHostedActiveProjectId()).toBe("proj-new");
  });
});
