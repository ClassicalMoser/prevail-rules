import { createEmptyStandardBoard, getSpacesWithinDistance } from "@functions";
import { describe, expect, it } from "vitest";

const standardBoard = createEmptyStandardBoard();

describe("getSpacesWithinDistance", () => {
  it("should return only the starting coordinate when distance is 0", () => {
    expect(getSpacesWithinDistance(standardBoard, "E-5", 0)).toEqual(
      new Set(["E-5"]),
    );
  });

  it("should return only the starting coordinate when distance is negative", () => {
    expect(getSpacesWithinDistance(standardBoard, "E-5", -1)).toEqual(
      new Set(["E-5"]),
    );
  });

  it("should return the starting coordinate and adjacent spaces when distance is 1", () => {
    const result = getSpacesWithinDistance(standardBoard, "E-5", 1);
    // Should include E-5 and all 8 adjacent spaces
    expect(result).toEqual(
      new Set([
        "E-5", // Starting coordinate
        "D-4",
        "D-5",
        "D-6", // North, NorthEast, East
        "E-4",
        "E-6", // West, East
        "F-4",
        "F-5",
        "F-6", // SouthWest, South, SouthEast
      ]),
    );
    expect(result.size).toBe(9);
  });

  it("should return spaces within distance 2 from center coordinate", () => {
    const result = getSpacesWithinDistance(standardBoard, "E-5", 2);
    // Should include E-5, all adjacent spaces (distance 1), and spaces 2 steps away
    expect(result.has("E-5")).toBe(true); // Starting coordinate
    expect(result.has("D-5")).toBe(true); // Distance 1
    expect(result.has("C-5")).toBe(true); // Distance 2
    expect(result.has("D-4")).toBe(true); // Distance 1
    expect(result.has("C-3")).toBe(true); // Distance 2
    expect(result.has("C-4")).toBe(true); // Distance 2
    expect(result.size).toBeGreaterThan(9); // More than just distance 1
  });

  it("should handle corner coordinates correctly", () => {
    // From corner A-1, distance 1 should only include valid adjacent spaces
    const result = getSpacesWithinDistance(standardBoard, "A-1", 1);
    expect(result.has("A-1")).toBe(true); // Starting coordinate
    expect(result.has("A-2")).toBe(true); // East
    expect(result.has("B-1")).toBe(true); // South
    expect(result.has("B-2")).toBe(true); // SouthEast
    expect(result.size).toBe(4); // Only 4 valid spaces from corner
  });

  it("should handle edge coordinates correctly", () => {
    // From edge coordinate A-5, distance 1
    const result = getSpacesWithinDistance(standardBoard, "A-5", 1);
    expect(result.has("A-5")).toBe(true); // Starting coordinate
    expect(result.has("A-4")).toBe(true); // West
    expect(result.has("A-6")).toBe(true); // East
    expect(result.has("B-4")).toBe(true); // SouthWest
    expect(result.has("B-5")).toBe(true); // South
    expect(result.has("B-6")).toBe(true); // SouthEast
    expect(result.size).toBe(6); // 6 valid spaces from edge
  });

  it("should return all spaces within distance 3 from center", () => {
    const result = getSpacesWithinDistance(standardBoard, "E-5", 3);
    // Should include spaces up to 3 steps away
    expect(result.has("E-5")).toBe(true); // Distance 0
    expect(result.has("D-5")).toBe(true); // Distance 1
    expect(result.has("C-5")).toBe(true); // Distance 2
    expect(result.has("B-5")).toBe(true); // Distance 3
    expect(result.size).toBeGreaterThan(20); // Many spaces at distance 3
  });

  it("should not include spaces beyond the specified distance", () => {
    const result = getSpacesWithinDistance(standardBoard, "E-5", 2);
    // B-5 is distance 3, so it should not be included
    expect(result.has("B-5")).toBe(false);
    // But C-5 is distance 2, so it should be included
    expect(result.has("C-5")).toBe(true);
  });

  it("should handle different starting coordinates", () => {
    const result1 = getSpacesWithinDistance(standardBoard, "F-6", 1);
    expect(result1.has("F-6")).toBe(true);
    expect(result1.size).toBe(9); // Center coordinate has 8 neighbors

    const result2 = getSpacesWithinDistance(standardBoard, "L-18", 1);
    expect(result2.has("L-18")).toBe(true);
    expect(result2.size).toBe(4); // Corner has fewer neighbors
  });
});
