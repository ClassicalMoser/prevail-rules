import type { StandardBoardCoordinate } from "@entities/index";
import { filterUndefinedSpaces } from "@functions/boardSpace/filterUndefinedSpaces";
import { describe, expect, it } from "vitest";

describe("filterUndefinedSpaces", () => {
  it("should filter out undefined spaces", () => {
    const spaces = new Set<StandardBoardCoordinate | undefined>([
      "A-1",
      "A-2",
      undefined,
      "A-3",
    ]) as Set<StandardBoardCoordinate>;
    expect(filterUndefinedSpaces(spaces)).toEqual(
      new Set(["A-1", "A-2", "A-3"]),
    );
  });
});
