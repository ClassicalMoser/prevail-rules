import { describe, expect, it } from "vitest";
import { getAdjacentFacings } from "./getAdjacentFacings.js";
describe("getAdjacentFacings", () => {
  it("should return the adjacent facings for orthogonal facing directions", () => {
    expect(getAdjacentFacings("north")).toEqual(
      new Set(["northWest", "northEast"]),
    );
    expect(getAdjacentFacings("east")).toEqual(
      new Set(["northEast", "southEast"]),
    );
    expect(getAdjacentFacings("south")).toEqual(
      new Set(["southEast", "southWest"]),
    );
    expect(getAdjacentFacings("west")).toEqual(
      new Set(["southWest", "northWest"]),
    );
  });
  it("should return the adjacent facings for diagonal facing directions", () => {
    expect(getAdjacentFacings("northEast")).toEqual(new Set(["north", "east"]));
    expect(getAdjacentFacings("southEast")).toEqual(new Set(["east", "south"]));
    expect(getAdjacentFacings("southWest")).toEqual(new Set(["south", "west"]));
    expect(getAdjacentFacings("northWest")).toEqual(new Set(["west", "north"]));
  });
  it("should throw an error if the facing is invalid", () => {
    expect(() => getAdjacentFacings("invalid")).toThrow(
      new Error("Invalid facing: invalid"),
    );
  });
});
