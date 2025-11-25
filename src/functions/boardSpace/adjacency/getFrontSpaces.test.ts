import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { describe, expect, it } from "vitest";
import { createEmptyStandardBoard } from "../../createEmptyBoard.js";
import { getFrontSpaces } from "./getFrontSpaces.js";

const standardBoard = createEmptyStandardBoard();

describe("getFrontSpaces", () => {
  it("should return the front spaces for orthogonal facing directions", () => {
    // For north facing, front spaces are: northWest, northEast, north (in that order)
    expect(getFrontSpaces(standardBoard, "E-5", "north")).toEqual(
      new Set(["D-4", "D-6", "D-5"])
    );
    // For east facing, front spaces are: northEast, southEast, east (in that order)
    expect(getFrontSpaces(standardBoard, "E-5", "east")).toEqual(
      new Set(["D-6", "F-6", "E-6"])
    );
    // For south facing, front spaces are: southEast, southWest, south (in that order)
    expect(getFrontSpaces(standardBoard, "E-5", "south")).toEqual(
      new Set(["F-6", "F-4", "F-5"])
    );
    // For west facing, front spaces are: southWest, northWest, west (in that order)
    expect(getFrontSpaces(standardBoard, "E-5", "west")).toEqual(
      new Set(["F-4", "D-4", "E-4"])
    );
  });

  it("should return the front spaces for diagonal facing directions", () => {
    // For northEast facing, front spaces are: north, east, northEast (in that order)
    expect(getFrontSpaces(standardBoard, "E-5", "northEast")).toEqual(
      new Set(["D-5", "E-6", "D-6"])
    );
    // For southEast facing, front spaces are: east, south, southEast (in that order)
    expect(getFrontSpaces(standardBoard, "E-5", "southEast")).toEqual(
      new Set(["E-6", "F-5", "F-6"])
    );
    // For southWest facing, front spaces are: south, west, southWest (in that order)
    expect(getFrontSpaces(standardBoard, "E-5", "southWest")).toEqual(
      new Set(["F-5", "E-4", "F-4"])
    );
    // For northWest facing, front spaces are: west, north, northWest (in that order)
    expect(getFrontSpaces(standardBoard, "E-5", "northWest")).toEqual(
      new Set(["E-4", "D-5", "D-4"])
    );
  });

  it("should filter out out-of-bounds spaces", () => {
    // At corner A1 facing south, should only get valid spaces (southEast, southWest, south)
    expect(getFrontSpaces(standardBoard, "A-1", "south")).toEqual(
      new Set(["B-2", "B-1"])
    );
    // At corner A1 facing east, should only get valid spaces (northEast, southEast, east)
    expect(getFrontSpaces(standardBoard, "A-1", "east")).toEqual(
      new Set(["B-2", "A-2"])
    );
    // At corner L18 facing north, should only get valid spaces (northWest, northEast, north)
    expect(getFrontSpaces(standardBoard, "L-18", "north")).toEqual(
      new Set(["K-17", "K-18"])
    );
    // At corner L18 facing west, should only get valid spaces (southWest, northWest, west)
    expect(getFrontSpaces(standardBoard, "L-18", "west")).toEqual(
      new Set(["K-17", "L-17"])
    );
  });

  it("should return empty set if all front spaces are out of bounds", () => {
    expect(getFrontSpaces(standardBoard, "A-5", "north")).toEqual(new Set([]));
    expect(getFrontSpaces(standardBoard, "E-18", "east")).toEqual(new Set([]));
  });

  it("should throw an error if the row is invalid", () => {
    expect(() =>
      getFrontSpaces(standardBoard, "R-12" as StandardBoardCoordinate, "north")
    ).toThrow(new Error("Invalid row: R"));
  });

  it("should throw an error if the column is invalid", () => {
    expect(() =>
      getFrontSpaces(standardBoard, "A-19" as StandardBoardCoordinate, "north")
    ).toThrow(new Error("Invalid column: 19"));
  });

  it("should throw an error if the facing is invalid", () => {
    expect(() =>
      getFrontSpaces(standardBoard, "E-9", "random" as UnitFacing)
    ).toThrow(new Error("Invalid facing: random"));
  });
});
