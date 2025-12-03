import { createEmptyStandardBoard, getSpacesAhead } from "@functions";
import { describe, expect, it } from "vitest";

const standardBoard = createEmptyStandardBoard();

describe("getSpacesAhead", () => {
  it("should return the spaces behind when facing west from F2", () => {
    expect(getSpacesAhead(standardBoard, "F-2", "west")).toEqual(
      new Set([
        "A-1",
        "B-1",
        "C-1",
        "D-1",
        "E-1",
        "F-1",
        "G-1",
        "H-1",
        "I-1",
        "J-1",
        "K-1",
        "L-1",
      ]),
    );
  });
  it("should return the spaces behind when facing north from B7", () => {
    expect(getSpacesAhead(standardBoard, "B-7", "north")).toEqual(
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
  it("should return the spaces ahead when facing East from F16", () => {
    expect(getSpacesAhead(standardBoard, "F-16", "east")).toEqual(
      new Set([
        "A-17",
        "A-18",
        "B-17",
        "B-18",
        "C-17",
        "C-18",
        "D-17",
        "D-18",
        "E-17",
        "E-18",
        "F-17",
        "F-18",
        "G-17",
        "G-18",
        "H-17",
        "H-18",
        "I-17",
        "I-18",
        "J-17",
        "J-18",
        "K-17",
        "K-18",
        "L-17",
        "L-18",
      ]),
    );
  });
  it("should return the spaces ahead when facing northWest from B2", () => {
    expect(getSpacesAhead(standardBoard, "B-2", "northWest")).toEqual(
      new Set(["A-1", "B-1", "A-2"]),
    );
  });
  it("should return the spaces ahead when facing southWest from J3", () => {
    expect(getSpacesAhead(standardBoard, "J-3", "southWest")).toEqual(
      new Set([
        "I-1",
        "J-1",
        "J-2",
        "K-1",
        "K-2",
        "K-3",
        "L-1",
        "L-2",
        "L-3",
        "L-4",
      ]),
    );
  });
});
