import { createEmptyStandardBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { getForwardSpacesToEdge } from "./getForwardSpacesToEdge";

const standardBoard = createEmptyStandardBoard();

/**
 * getForwardSpacesToEdge: all coordinates from a start along a facing until the board edge (exclusive of start).
 */
describe("getForwardSpacesToEdge", () => {
  it("given facing south from A-1, returns column to L-1", () => {
    expect(getForwardSpacesToEdge(standardBoard, "A-1", "south")).toEqual(
      new Set(["B-1", "C-1", "D-1", "E-1", "F-1", "G-1", "H-1", "I-1", "J-1", "K-1", "L-1"]),
    );
  });
  it("given facing east from E-5, returns E-6 through E-18", () => {
    expect(getForwardSpacesToEdge(standardBoard, "E-5", "east")).toEqual(
      new Set([
        "E-6",
        "E-7",
        "E-8",
        "E-9",
        "E-10",
        "E-11",
        "E-12",
        "E-13",
        "E-14",
        "E-15",
        "E-16",
        "E-17",
        "E-18",
      ]),
    );
  });
  it("given facing northEast from E-5, returns diagonal to A-9", () => {
    expect(getForwardSpacesToEdge(standardBoard, "E-5", "northEast")).toEqual(
      new Set(["D-6", "C-7", "B-8", "A-9"]),
    );
  });
  it("given facing southEast from E-5, returns diagonal to L-12", () => {
    expect(getForwardSpacesToEdge(standardBoard, "E-5", "southEast")).toEqual(
      new Set(["F-6", "G-7", "H-8", "I-9", "J-10", "K-11", "L-12"]),
    );
  });
  it("given facing southWest from G-9, returns diagonal to L-4", () => {
    expect(getForwardSpacesToEdge(standardBoard, "G-9", "southWest")).toEqual(
      new Set(["H-8", "I-7", "J-6", "K-5", "L-4"]),
    );
  });
  it("given facing northWest from G-9, returns diagonal to A-3", () => {
    expect(getForwardSpacesToEdge(standardBoard, "G-9", "northWest")).toEqual(
      new Set(["F-8", "E-7", "D-6", "C-5", "B-4", "A-3"]),
    );
  });
});
