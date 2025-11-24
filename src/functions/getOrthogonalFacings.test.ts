import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { describe, expect, it } from "vitest";
import { getOrthogonalFacings } from "./getOrthogonalFacings.js";

describe("getOrthogonalFacings", () => {
  it("should return the orthogonal facings for orthogonal facing directions", () => {
    expect(getOrthogonalFacings("north")).toEqual(["west", "east"]);
    expect(getOrthogonalFacings("east")).toEqual(["north", "south"]);
    expect(getOrthogonalFacings("south")).toEqual(["east", "west"]);
    expect(getOrthogonalFacings("west")).toEqual(["south", "north"]);
  });

  it("should return the orthogonal facings for diagonal facing directions", () => {
    expect(getOrthogonalFacings("northEast")).toEqual(["northWest", "southEast"]);
    expect(getOrthogonalFacings("southEast")).toEqual(["northEast", "southWest"]);
    expect(getOrthogonalFacings("southWest")).toEqual(["southEast", "northWest"]);
    expect(getOrthogonalFacings("northWest")).toEqual(["southWest", "northEast"]);
  });

  it("should throw an error if the facing is invalid", () => {
    expect(() => getOrthogonalFacings("invalid" as UnitFacing)).toThrow(
      new Error("Invalid facing: invalid")
    );
  });
});

