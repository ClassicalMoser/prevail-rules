import type { BoardCoordinate, SmallBoard } from "@entities";
import {
  createEmptySmallBoard,
  createEmptyStandardBoard,
  getSpacesBehind,
} from "@functions";
import { describe, expect, it } from "vitest";

const standardBoard = createEmptyStandardBoard();
const smallBoard = createEmptySmallBoard();

describe("getSpacesBehind", () => {
  it("should return the spaces behind when facing east from F2", () => {
    expect(getSpacesBehind(standardBoard, "F-2", "east")).toEqual(
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
  it("should return the spaces behind when facing south from B7", () => {
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
  it("should return the spaces behind when facing west from F16", () => {
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
  it("should return the spaces behind when facing southEast from B2", () => {
    expect(getSpacesBehind(standardBoard, "B-2", "southEast")).toEqual(
      new Set(["A-1", "B-1", "A-2"]),
    );
  });
  it("should return the spaces behind when facing northEast from J3", () => {
    expect(getSpacesBehind(standardBoard, "J-3", "northEast")).toEqual(
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

  describe("small board", () => {
    it("should return empty set when facing northWest from H-12 (southeast corner - no back spaces)", () => {
      // From H-12 (southeast corner) facing northWest
      // Back spaces are the front spaces when facing southEast
      // But H-12 is the corner, so facing southEast has no valid front spaces (all out of bounds)
      expect(getSpacesBehind(smallBoard, "H-12", "northWest")).toEqual(
        new Set([]),
      );
    });

    it("should return the spaces behind when facing northWest from E-6 (center position)", () => {
      // From E-6 (center-ish) facing northWest
      // Back spaces are the front spaces when facing southEast
      // This should include spaces in the southEast direction and all spaces behind them
      const result = getSpacesBehind(smallBoard, "E-6", "northWest");
      // Should include the back spaces (F-7, F-6, F-5) and all spaces behind them
      expect(result.size).toBeGreaterThan(0);
      // Should include the immediate back spaces
      expect(result.has("F-7")).toBe(true);
      expect(result.has("F-6")).toBe(true);
      expect(result.has("F-8")).toBe(true);
      // Should include spaces behind those (southEast direction)
      expect(result.has("G-8")).toBe(true);
      expect(result.has("H-9")).toBe(true);
      // Should not include spaces that are ahead (northWest direction)
      expect(result.has("D-5")).toBe(false);
      expect(result.has("C-4")).toBe(false);
      // Should not include spaces that only the standard board has
      expect(result.has("A-18" as BoardCoordinate<SmallBoard>)).toBe(false);
      expect(result.has("L-18" as BoardCoordinate<SmallBoard>)).toBe(false);
      expect(result.has("L-1" as BoardCoordinate<SmallBoard>)).toBe(false);
    });
  });
});
