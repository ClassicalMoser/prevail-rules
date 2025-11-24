import type { StandardBoardCoordinate } from "src/entities/index.js";
import { describe, expect, it } from "vitest";
import { filterUndefinedSpaces } from "./filterUndefinedSpaces.js";

describe("filterUndefinedSpaces", () => {
  it("should filter out undefined spaces", () => {
    const spaces = new Set<StandardBoardCoordinate | undefined>([
      "A1",
      "A2",
      undefined,
      "A3",
    ]) as Set<StandardBoardCoordinate>;
    expect(filterUndefinedSpaces(spaces)).toEqual(new Set(["A1", "A2", "A3"]));
  });
});
