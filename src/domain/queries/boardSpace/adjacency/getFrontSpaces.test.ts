import type { StandardBoardCoordinate, UnitFacing } from "@entities";
import { createEmptyStandardBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { getFrontSpaces } from "./getFrontSpaces";

const standardBoard = createEmptyStandardBoard();

/**
 * getFrontSpaces: the three spaces in the unit's front arc (two flanking diagonals + forward), clipped to the board.
 */
describe("getFrontSpaces", () => {
  it("given cardinal facings at E-5, returns three-space front arc each", () => {
    expect(getFrontSpaces(standardBoard, "E-5", "north")).toEqual(new Set(["D-4", "D-6", "D-5"]));
    expect(getFrontSpaces(standardBoard, "E-5", "east")).toEqual(new Set(["D-6", "F-6", "E-6"]));
    expect(getFrontSpaces(standardBoard, "E-5", "south")).toEqual(new Set(["F-6", "F-4", "F-5"]));
    expect(getFrontSpaces(standardBoard, "E-5", "west")).toEqual(new Set(["F-4", "D-4", "E-4"]));
  });

  it("given diagonal facings at E-5, returns three-space front arc each", () => {
    expect(getFrontSpaces(standardBoard, "E-5", "northEast")).toEqual(
      new Set(["D-5", "E-6", "D-6"]),
    );
    expect(getFrontSpaces(standardBoard, "E-5", "southEast")).toEqual(
      new Set(["E-6", "F-5", "F-6"]),
    );
    expect(getFrontSpaces(standardBoard, "E-5", "southWest")).toEqual(
      new Set(["F-5", "E-4", "F-4"]),
    );
    expect(getFrontSpaces(standardBoard, "E-5", "northWest")).toEqual(
      new Set(["E-4", "D-5", "D-4"]),
    );
  });

  it("given corners, clips arcs to in-bounds spaces", () => {
    expect(getFrontSpaces(standardBoard, "A-1", "south")).toEqual(new Set(["B-2", "B-1"]));
    expect(getFrontSpaces(standardBoard, "A-1", "east")).toEqual(new Set(["B-2", "A-2"]));
    expect(getFrontSpaces(standardBoard, "L-18", "north")).toEqual(new Set(["K-17", "K-18"]));
    expect(getFrontSpaces(standardBoard, "L-18", "west")).toEqual(new Set(["K-17", "L-17"]));
  });

  it("given edge where entire arc is off board, returns empty set", () => {
    expect(getFrontSpaces(standardBoard, "A-5", "north")).toEqual(new Set([]));
    expect(getFrontSpaces(standardBoard, "E-18", "east")).toEqual(new Set([]));
  });

  it("given invalid row letter, throws", () => {
    expect(() => getFrontSpaces(standardBoard, "R-12" as StandardBoardCoordinate, "north")).toThrow(
      new Error("Invalid row: R"),
    );
  });

  it("given invalid column, throws", () => {
    expect(() => getFrontSpaces(standardBoard, "A-19" as StandardBoardCoordinate, "north")).toThrow(
      new Error("Invalid column: 19"),
    );
  });

  it("given invalid facing, throws", () => {
    expect(() => getFrontSpaces(standardBoard, "E-9", "random" as UnitFacing)).toThrow(
      new Error("Invalid facing: random"),
    );
  });
});
