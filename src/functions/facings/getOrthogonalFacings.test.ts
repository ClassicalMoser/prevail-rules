import type { UnitFacing } from "@entities";
import { getOrthogonalFacings } from "@functions/facings";
import { describe, expect, it } from "vitest";

describe("getOrthogonalFacings", () => {
  it("should return the orthogonal facings for north", () => {
    expect(getOrthogonalFacings("north")).toEqual(new Set(["west", "east"]));
  });
  it("should return the orthogonal facings for east", () => {
    expect(getOrthogonalFacings("east")).toEqual(new Set(["north", "south"]));
  });
  it("should return the orthogonal facings for south", () => {
    expect(getOrthogonalFacings("south")).toEqual(new Set(["east", "west"]));
  });
  it("should return the orthogonal facings for west", () => {
    expect(getOrthogonalFacings("west")).toEqual(new Set(["south", "north"]));
  });

  it("should return the orthogonal facings for northEast", () => {
    expect(getOrthogonalFacings("northEast")).toEqual(
      new Set(["northWest", "southEast"]),
    );
  });
  it("should return the orthogonal facings for southEast", () => {
    expect(getOrthogonalFacings("southEast")).toEqual(
      new Set(["northEast", "southWest"]),
    );
  });
  it("should return the orthogonal facings for southWest", () => {
    expect(getOrthogonalFacings("southWest")).toEqual(
      new Set(["southEast", "northWest"]),
    );
  });
  it("should return the orthogonal facings for northWest", () => {
    expect(getOrthogonalFacings("northWest")).toEqual(
      new Set(["southWest", "northEast"]),
    );
  });

  it("should throw an error if the facing is invalid", () => {
    expect(() => getOrthogonalFacings("invalid" as UnitFacing)).toThrow(
      new Error("Invalid facing: invalid"),
    );
  });
});
