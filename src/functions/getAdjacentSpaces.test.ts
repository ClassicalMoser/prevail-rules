import { describe, expect, it } from "vitest";
import { getAdjacentSpaces } from "./getAdjacentSpaces.js";

describe("getAdjacentSpaces", () => {
  it("should return the adjacent spaces for a given coordinate", () => {
    expect(getAdjacentSpaces("A1")).toEqual(new Set(["B1", "B2", "A2"]));
    expect(getAdjacentSpaces("E5")).toEqual(
      new Set(["D5", "D6", "E6", "F6", "F5", "F4", "E4", "D4"])
    );
    expect(getAdjacentSpaces("L18")).toEqual(new Set(["K18", "K17", "L17"]));
  });
});
