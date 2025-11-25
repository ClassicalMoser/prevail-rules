import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { describe, expect, it } from "vitest";
import { getFrontSpaces } from "./getFrontSpaces.js";

describe("getFrontSpaces", () => {
  it("should return the front spaces for orthogonal facing directions", () => {
    // For north facing, front spaces are: northWest, northEast, north (in that order)
    expect(getFrontSpaces("E5", "north")).toEqual(new Set(["D4", "D6", "D5"]));
    // For east facing, front spaces are: northEast, southEast, east (in that order)
    expect(getFrontSpaces("E5", "east")).toEqual(new Set(["D6", "F6", "E6"]));
    // For south facing, front spaces are: southEast, southWest, south (in that order)
    expect(getFrontSpaces("E5", "south")).toEqual(new Set(["F6", "F4", "F5"]));
    // For west facing, front spaces are: southWest, northWest, west (in that order)
    expect(getFrontSpaces("E5", "west")).toEqual(new Set(["F4", "D4", "E4"]));
  });

  it("should return the front spaces for diagonal facing directions", () => {
    // For northEast facing, front spaces are: north, east, northEast (in that order)
    expect(getFrontSpaces("E5", "northEast")).toEqual(
      new Set(["D5", "E6", "D6"])
    );
    // For southEast facing, front spaces are: east, south, southEast (in that order)
    expect(getFrontSpaces("E5", "southEast")).toEqual(
      new Set(["E6", "F5", "F6"])
    );
    // For southWest facing, front spaces are: south, west, southWest (in that order)
    expect(getFrontSpaces("E5", "southWest")).toEqual(
      new Set(["F5", "E4", "F4"])
    );
    // For northWest facing, front spaces are: west, north, northWest (in that order)
    expect(getFrontSpaces("E5", "northWest")).toEqual(
      new Set(["E4", "D5", "D4"])
    );
  });

  it("should filter out out-of-bounds spaces", () => {
    // At corner A1 facing south, should only get valid spaces (southEast, southWest, south)
    expect(getFrontSpaces("A1", "south")).toEqual(new Set(["B2", "B1"]));
    // At corner A1 facing east, should only get valid spaces (northEast, southEast, east)
    expect(getFrontSpaces("A1", "east")).toEqual(new Set(["B2", "A2"]));
    // At corner L18 facing north, should only get valid spaces (northWest, northEast, north)
    expect(getFrontSpaces("L18", "north")).toEqual(new Set(["K17", "K18"]));
    // At corner L18 facing west, should only get valid spaces (southWest, northWest, west)
    expect(getFrontSpaces("L18", "west")).toEqual(new Set(["K17", "L17"]));
  });

  it("should return empty set if all front spaces are out of bounds", () => {
    expect(getFrontSpaces("A5", "north")).toEqual(new Set([]));
    expect(getFrontSpaces("E18", "east")).toEqual(new Set([]));
  });

  it("should throw an error if the row is invalid", () => {
    expect(() =>
      getFrontSpaces("R12" as StandardBoardCoordinate, "north")
    ).toThrow(new Error("Invalid row: R"));
  });

  it("should throw an error if the column is invalid", () => {
    expect(() =>
      getFrontSpaces("A19" as StandardBoardCoordinate, "north")
    ).toThrow(new Error("Invalid column: 19"));
  });

  it("should throw an error if the facing is invalid", () => {
    expect(() => getFrontSpaces("E9", "random" as UnitFacing)).toThrow(
      new Error("Invalid facing: random")
    );
  });
});
