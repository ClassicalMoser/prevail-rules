import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { describe, expect, it } from "vitest";
import { getAdjacentFacings } from "./getAdjacentFacings.js";

describe("getAdjacentFacings", () => {
  it("should return the adjacent facings for orthogonal facing directions", () => {
    expect(getAdjacentFacings("north")).toEqual(["northWest", "northEast"]);
    expect(getAdjacentFacings("east")).toEqual(["northEast", "southEast"]);
    expect(getAdjacentFacings("south")).toEqual(["southEast", "southWest"]);
    expect(getAdjacentFacings("west")).toEqual(["southWest", "northWest"]);
  });
  it("should return the adjacent facings for diagonal facing directions", () => {
    expect(getAdjacentFacings("northEast")).toEqual(["north", "east"]);
    expect(getAdjacentFacings("southEast")).toEqual(["east", "south"]);
    expect(getAdjacentFacings("southWest")).toEqual(["south", "west"]);
    expect(getAdjacentFacings("northWest")).toEqual(["west", "north"]);
  });

  it("should throw an error if the facing is invalid", () => {
    expect(() => getAdjacentFacings("invalid" as UnitFacing)).toThrow(
      new Error("Invalid facing: invalid")
    );
  });
});
