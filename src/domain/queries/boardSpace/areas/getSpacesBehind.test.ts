import type { BoardCoordinate, SmallBoard } from "@entities";
import { createEmptySmallBoard, createEmptyStandardBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { getSpacesBehind } from "./getSpacesBehind";

const standardBoard = createEmptyStandardBoard();
const smallBoard = createEmptySmallBoard();

/**
 * getSpacesBehind: all board spaces strictly forward of the rear arc (same as “ahead” for the opposite facing).
 */
describe("getSpacesBehind", () => {
  it("given facing east from F-2, returns wedge behind unit (west of rear arc)", () => {
    expect(getSpacesBehind(standardBoard, "F-2", "east")).toEqual(
      new Set(["A-1", "B-1", "C-1", "D-1", "E-1", "F-1", "G-1", "H-1", "I-1", "J-1", "K-1", "L-1"]),
    );
  });
  it("given facing south from B-7, returns wedge behind unit", () => {
    expect(getSpacesBehind(standardBoard, "B-7", "south")).toEqual(
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
  it("given facing west from F-16, returns wedge behind unit", () => {
    expect(getSpacesBehind(standardBoard, "F-16", "west")).toEqual(
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
  it("given facing southEast from B-2, returns small rear wedge", () => {
    expect(getSpacesBehind(standardBoard, "B-2", "southEast")).toEqual(
      new Set(["A-1", "B-1", "A-2"]),
    );
  });
  it("given facing northEast from J-3, returns rear wedge toward northeast", () => {
    expect(getSpacesBehind(standardBoard, "J-3", "northEast")).toEqual(
      new Set(["I-1", "J-1", "J-2", "K-1", "K-2", "K-3", "L-1", "L-2", "L-3", "L-4"]),
    );
  });

  describe("small board", () => {
    it("given corner H-12 facing northWest, rear wedge may be empty", () => {
      expect(getSpacesBehind(smallBoard, "H-12", "northWest")).toEqual(new Set([]));
    });

    it("given E-6 facing northWest, rear wedge includes southEast quadrant", () => {
      const result = getSpacesBehind(smallBoard, "E-6", "northWest");
      expect(result.size).toBeGreaterThan(0);
      expect(result.has("F-7")).toBe(true);
      expect(result.has("F-6")).toBe(true);
      expect(result.has("F-8")).toBe(true);
      expect(result.has("G-8")).toBe(true);
      expect(result.has("H-9")).toBe(true);
      expect(result.has("D-5")).toBe(false);
      expect(result.has("C-4")).toBe(false);
      expect(result.has("A-18" as BoardCoordinate<SmallBoard>)).toBe(false);
      expect(result.has("L-18" as BoardCoordinate<SmallBoard>)).toBe(false);
      expect(result.has("L-1" as BoardCoordinate<SmallBoard>)).toBe(false);
    });
  });
});
