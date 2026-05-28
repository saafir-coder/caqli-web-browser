import { describe, expect, it } from "vitest";

import {
  buildDiffSearchClosed,
  buildDiffSearchOpen,
  buildDiffSearchToggled,
} from "./diffRouteController";

describe("diffRouteController", () => {
  it("opens and closes diff search params", () => {
    expect(buildDiffSearchOpen({ foo: "bar" })).toEqual({ foo: "bar", diff: true });
    expect(buildDiffSearchOpen({ diff: "1", diffTurnId: "old" }, { turnId: "turn-1" as never })).toEqual({
      diff: true,
      diffTurnId: "turn-1",
    });
    expect(buildDiffSearchClosed({ diff: true, diffTurnId: "turn-1", keep: "yes" })).toEqual({
      keep: "yes",
    });
  });

  it("toggles diff search params", () => {
    expect(buildDiffSearchToggled({ diff: true }, true)).toEqual({});
    expect(buildDiffSearchToggled({}, false)).toEqual({ diff: true });
  });
});
