import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { describe, expect, it } from "vitest";
import { createEmptyStandardBoard } from "../../createEmptyBoard.js";
import { getBackSpaces } from "./getBackSpaces.js";

const standardBoard = createEmptyStandardBoard();

describe("getBackSpaces", () => {
  it("should return the back spaces for orthogonal facing directions", () => {
    // For north facing, back spaces are the front spaces when facing south
    expect(getBackSpaces(standardBoard, "E-5", "north")).toEqual(
      new Set(["F-6", "F-4", "F-5"]),
    );
    // For east facing, back spaces are the front spaces when facing west
    expect(getBackSpaces(standardBoard, "E-5", "east")).toEqual(
      new Set(["F-4", "D-4", "E-4"]),
    );
    // For south facing, back spaces are the front spaces when facing north
    expect(getBackSpaces(standardBoard, "E-5", "south")).toEqual(
      new Set(["D-4", "D-6", "D-5"]),
    );
    // For west facing, back spaces are the front spaces when facing east
    expect(getBackSpaces(standardBoard, "E-5", "west")).toEqual(
      new Set(["D-6", "F-6", "E-6"]),
    );
  });

  it("should return the back spaces for diagonal facing directions", () => {
    // For northEast facing, back spaces are the front spaces when facing southWest
    expect(getBackSpaces(standardBoard, "E-5", "northEast")).toEqual(
      new Set(["F-5", "E-4", "F-4"]),
    );
    // For southEast facing, back spaces are the front spaces when facing northWest
    expect(getBackSpaces(standardBoard, "E-5", "southEast")).toEqual(
      new Set(["E-4", "D-5", "D-4"]),
    );
    // For southWest facing, back spaces are the front spaces when facing northEast
    expect(getBackSpaces(standardBoard, "E-5", "southWest")).toEqual(
      new Set(["D-5", "E-6", "D-6"]),
    );
    // For northWest facing, back spaces are the front spaces when facing southEast
    expect(getBackSpaces(standardBoard, "E-5", "northWest")).toEqual(
      new Set(["E-6", "F-5", "F-6"]),
    );
  });

  it("should filter out out-of-bounds spaces", () => {
    // At corner A1 facing north, back spaces are south (southEast, southWest, south)
    expect(getBackSpaces(standardBoard, "A-1", "north")).toEqual(
      new Set(["B-2", "B-1"]),
    );
    // At corner L18 facing south, back spaces are north (northWest, northEast, north)
    expect(getBackSpaces(standardBoard, "L-18", "south")).toEqual(
      new Set(["K-17", "K-18"]),
    );
  });

  it("should throw an error if the row is invalid", () => {
    expect(() =>
      getBackSpaces(standardBoard, "R-12" as StandardBoardCoordinate, "north"),
    ).toThrow(new Error("Invalid row: R"));
  });

  it("should throw an error if the column is invalid", () => {
    expect(() =>
      getBackSpaces(standardBoard, "A-19" as StandardBoardCoordinate, "north"),
    ).toThrow(new Error("Invalid column: 19"));
  });

  it("should throw an error if the facing is invalid", () => {
    expect(() =>
      getBackSpaces(standardBoard, "E-9", "random" as UnitFacing),
    ).toThrow(new Error("Invalid facing: random"));
  });
});
