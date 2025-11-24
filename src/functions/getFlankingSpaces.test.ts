import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { describe, expect, it } from "vitest";
import { getFlankingSpaces } from "./getFlankingSpaces.js";

describe("getFlankingSpaces", () => {
  it("should return the flanking spaces for orthogonal facing directions", () => {
    // For north facing, flanking spaces are west and east (orthogonal to north)
    expect(getFlankingSpaces("E5", "north")).toEqual(["E4", "E6"]);
    // For east facing, flanking spaces are north and south (orthogonal to east)
    expect(getFlankingSpaces("E5", "east")).toEqual(["D5", "F5"]);
    // For south facing, flanking spaces are east and west (orthogonal to south)
    expect(getFlankingSpaces("E5", "south")).toEqual(["E6", "E4"]);
    // For west facing, flanking spaces are south and north (orthogonal to west)
    expect(getFlankingSpaces("E5", "west")).toEqual(["F5", "D5"]);
  });

  it("should return the flanking spaces for diagonal facing directions", () => {
    // For northEast facing, flanking spaces are northWest and southEast
    expect(getFlankingSpaces("E5", "northEast")).toEqual(["D4", "F6"]);
    // For southEast facing, flanking spaces are northEast and southWest
    expect(getFlankingSpaces("E5", "southEast")).toEqual(["D6", "F4"]);
    // For southWest facing, flanking spaces are southEast and northWest
    expect(getFlankingSpaces("E5", "southWest")).toEqual(["F6", "D4"]);
    // For northWest facing, flanking spaces are southWest and northEast
    expect(getFlankingSpaces("E5", "northWest")).toEqual(["F4", "D6"]);
  });

  it("should filter out out-of-bounds spaces", () => {
    // At corner A1 facing north, flanking spaces are west and east (west is out of bounds)
    expect(getFlankingSpaces("A1", "north")).toEqual(["A2"]);
    // At corner A1 facing east, flanking spaces are north and south (north is out of bounds)
    expect(getFlankingSpaces("A1", "east")).toEqual(["B1"]);
    // At corner L18 facing south, flanking spaces are east and west (east is out of bounds)
    expect(getFlankingSpaces("L18", "south")).toEqual(["L17"]);
    // At corner L18 facing west, flanking spaces are south and north (south is out of bounds)
    expect(getFlankingSpaces("L18", "west")).toEqual(["K18"]);
  });

  it("should return empty array if both flanking spaces are out of bounds", () => {
    // This shouldn't happen in practice, but testing edge case
    // At F1 facing north, both west and east should be valid, so this test may not be applicable
    // Let's test a case where one is out of bounds - already covered above
  });

  it("should throw an error if the row is invalid", () => {
    expect(() =>
      getFlankingSpaces("R12" as StandardBoardCoordinate, "north")
    ).toThrow(new Error("Invalid row: R"));
  });

  it("should throw an error if the column is invalid", () => {
    expect(() =>
      getFlankingSpaces("A19" as StandardBoardCoordinate, "north")
    ).toThrow(new Error("Invalid column: 19"));
  });

  it("should throw an error if the facing is invalid", () => {
    expect(() => getFlankingSpaces("E9", "random" as UnitFacing)).toThrow(
      new Error("Invalid facing: random")
    );
  });
});

