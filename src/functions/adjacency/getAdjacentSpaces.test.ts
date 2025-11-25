import { describe, expect, it } from "vitest";
import { createEmptyStandardBoard } from "../createEmptyBoard.js";
import { getAdjacentSpaces } from "./getAdjacentSpaces.js";

const standardBoard = createEmptyStandardBoard();

describe("getAdjacentSpaces", () => {
  it("should return the adjacent spaces for a given coordinate", () => {
    expect(getAdjacentSpaces(standardBoard, "A-1")).toEqual(
      new Set(["B-1", "B-2", "A-2"]),
    );
    expect(getAdjacentSpaces(standardBoard, "E-5")).toEqual(
      new Set(["D-4", "D-5", "D-6", "E-4", "E-6", "F-4", "F-5", "F-6"]),
    );
    expect(getAdjacentSpaces(standardBoard, "L-18")).toEqual(
      new Set(["K-18", "K-17", "L-17"]),
    );
  });
});
