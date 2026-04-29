import { createEmptyStandardBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { getInlineSpaces } from "./getInlineSpaces";

const standardBoard = createEmptyStandardBoard();

/**
 * getInlineSpaces: full line through the coordinate along the facing axis (both directions), clipped to board.
 */
describe("getInlineSpaces", () => {
  it("given facing south from A-1, returns column A", () => {
    expect(getInlineSpaces(standardBoard, "A-1", "south")).toEqual(
      new Set([
        "A-1",
        "A-2",
        "A-3",
        "A-4",
        "A-5",
        "A-6",
        "A-7",
        "A-8",
        "A-9",
        "A-10",
        "A-11",
        "A-12",
        "A-13",
        "A-14",
        "A-15",
        "A-16",
        "A-17",
        "A-18",
      ]),
    );
  });
  it("given facing east from E-5, returns row 5", () => {
    expect(getInlineSpaces(standardBoard, "E-5", "east")).toEqual(
      new Set(["A-5", "B-5", "C-5", "D-5", "E-5", "F-5", "G-5", "H-5", "I-5", "J-5", "K-5", "L-5"]),
    );
  });
  it("given facing northEast from E-5, returns main diagonal through E-5", () => {
    expect(getInlineSpaces(standardBoard, "E-5", "northEast")).toEqual(
      new Set([
        "A-1",
        "B-2",
        "C-3",
        "D-4",
        "E-5",
        "F-6",
        "G-7",
        "H-8",
        "I-9",
        "J-10",
        "K-11",
        "L-12",
      ]),
    );
  });
  it("given facing southEast from E-5, returns anti-diagonal through E-5", () => {
    expect(getInlineSpaces(standardBoard, "E-5", "southEast")).toEqual(
      new Set(["A-9", "B-8", "C-7", "D-6", "E-5", "F-4", "G-3", "H-2", "I-1"]),
    );
  });
});
