import type { UnitFacing } from "@entities";
import { describe, expect, it } from "vitest";
import { getLeftFacing } from "./getLeftFacing";

/**
 * getLeftFacing: maps a unit facing to the facing 45° counterclockwise (left relative to the unit's front arc).
 */
describe("getLeftFacing", () => {
  it("given north, returns west", () => {
    expect(getLeftFacing("north")).toBe("west");
  });
  it("given northEast, returns northWest", () => {
    expect(getLeftFacing("northEast")).toBe("northWest");
  });
  it("given east, returns north", () => {
    expect(getLeftFacing("east")).toBe("north");
  });
  it("given southEast, returns northEast", () => {
    expect(getLeftFacing("southEast")).toBe("northEast");
  });
  it("given south, returns east", () => {
    expect(getLeftFacing("south")).toBe("east");
  });
  it("given southWest, returns southEast", () => {
    expect(getLeftFacing("southWest")).toBe("southEast");
  });
  it("given west, returns south", () => {
    expect(getLeftFacing("west")).toBe("south");
  });
  it("given northWest, returns southWest", () => {
    expect(getLeftFacing("northWest")).toBe("southWest");
  });
  it("given invalid facing, throws", () => {
    expect(() => getLeftFacing("invalid" as UnitFacing)).toThrow("Invalid facing: invalid");
  });
});
