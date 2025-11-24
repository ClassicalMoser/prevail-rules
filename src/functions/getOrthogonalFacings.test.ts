import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { describe, expect, it } from "vitest";
import { getOrthogonalFacings } from "./getOrthogonalFacings.js";

describe("getOrthogonalFacings", () => {
  it("should return the orthogonal facings for orthogonal facing directions", () => {
    expect(getOrthogonalFacings("north")).toEqual(new Set(["west", "east"]));
    expect(getOrthogonalFacings("east")).toEqual(new Set(["north", "south"]));
    expect(getOrthogonalFacings("south")).toEqual(new Set(["east", "west"]));
    expect(getOrthogonalFacings("west")).toEqual(new Set(["south", "north"]));
  });

  it("should return the orthogonal facings for diagonal facing directions", () => {
    expect(getOrthogonalFacings("northEast")).toEqual(
      new Set(["northWest", "southEast"])
    );
    expect(getOrthogonalFacings("southEast")).toEqual(
      new Set(["northEast", "southWest"])
    );
    expect(getOrthogonalFacings("southWest")).toEqual(
      new Set(["southEast", "northWest"])
    );
    expect(getOrthogonalFacings("northWest")).toEqual(
      new Set(["southWest", "northEast"])
    );
  });

  it("should throw an error if the facing is invalid", () => {
    expect(() => getOrthogonalFacings("invalid" as UnitFacing)).toThrow(
      new Error("Invalid facing: invalid")
    );
  });
});
