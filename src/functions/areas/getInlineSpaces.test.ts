import { describe, expect, it } from "vitest";
import { createEmptyStandardBoard } from "../createEmptyBoard.js";
import { getInlineSpaces } from "./getInlineSpaces.js";

const standardBoard = createEmptyStandardBoard();

describe("getInlineSpaces", () => {
  it("should return the inline spaces when facing south from A1", () => {
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
  it("should return the inline spaces when facing east from E5", () => {
    expect(getInlineSpaces(standardBoard, "E-5", "east")).toEqual(
      new Set([
        "A-5",
        "B-5",
        "C-5",
        "D-5",
        "E-5",
        "F-5",
        "G-5",
        "H-5",
        "I-5",
        "J-5",
        "K-5",
        "L-5",
      ]),
    );
  });
  it("should return the inline spaces when facing northEast from E5", () => {
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
  it("should return the inline spaces when facing southEast from E5", () => {
    expect(getInlineSpaces(standardBoard, "E-5", "southEast")).toEqual(
      new Set(["A-9", "B-8", "C-7", "D-6", "E-5", "F-4", "G-3", "H-2", "I-1"]),
    );
  });
});
