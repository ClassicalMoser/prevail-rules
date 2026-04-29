import type { StandardBoardCoordinate, UnitFacing } from "@entities";
import { createEmptyStandardBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { getBackSpaces } from "./getBackSpaces";

const standardBoard = createEmptyStandardBoard();

/**
 * getBackSpaces: the three spaces in the unit's rear arc (mirror of front arc for the opposite facing).
 */
describe("getBackSpaces", () => {
  it("given cardinal facings at E-5, returns three-space rear arc each", () => {
    expect(getBackSpaces(standardBoard, "E-5", "north")).toEqual(new Set(["F-6", "F-4", "F-5"]));
    expect(getBackSpaces(standardBoard, "E-5", "east")).toEqual(new Set(["F-4", "D-4", "E-4"]));
    expect(getBackSpaces(standardBoard, "E-5", "south")).toEqual(new Set(["D-4", "D-6", "D-5"]));
    expect(getBackSpaces(standardBoard, "E-5", "west")).toEqual(new Set(["D-6", "F-6", "E-6"]));
  });

  it("given diagonal facings at E-5, returns three-space rear arc each", () => {
    expect(getBackSpaces(standardBoard, "E-5", "northEast")).toEqual(
      new Set(["F-5", "E-4", "F-4"]),
    );
    expect(getBackSpaces(standardBoard, "E-5", "southEast")).toEqual(
      new Set(["E-4", "D-5", "D-4"]),
    );
    expect(getBackSpaces(standardBoard, "E-5", "southWest")).toEqual(
      new Set(["D-5", "E-6", "D-6"]),
    );
    expect(getBackSpaces(standardBoard, "E-5", "northWest")).toEqual(
      new Set(["E-6", "F-5", "F-6"]),
    );
  });

  it("given corners, clips rear arc to in-bounds spaces", () => {
    expect(getBackSpaces(standardBoard, "A-1", "north")).toEqual(new Set(["B-2", "B-1"]));
    expect(getBackSpaces(standardBoard, "L-18", "south")).toEqual(new Set(["K-17", "K-18"]));
  });

  it("given invalid row letter, throws", () => {
    expect(() => getBackSpaces(standardBoard, "R-12" as StandardBoardCoordinate, "north")).toThrow(
      new Error("Invalid row: R"),
    );
  });

  it("given invalid column, throws", () => {
    expect(() => getBackSpaces(standardBoard, "A-19" as StandardBoardCoordinate, "north")).toThrow(
      new Error("Invalid column: 19"),
    );
  });

  it("given invalid facing, throws", () => {
    expect(() => getBackSpaces(standardBoard, "E-9", "random" as UnitFacing)).toThrow(
      new Error("Invalid facing: random"),
    );
  });
});
