import { createEmptyStandardBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { getSpacesWithinDistance } from "./getSpacesWithinDistance";

const standardBoard = createEmptyStandardBoard();

/**
 * getSpacesWithinDistance: Chebyshev distance (king moves): all coordinates within N steps including diagonals.
 */
describe("getSpacesWithinDistance", () => {
  it("given distance 0, returns only start", () => {
    expect(getSpacesWithinDistance(standardBoard, "E-5", 0)).toEqual(new Set(["E-5"]));
  });

  it("given negative distance, treats as 0", () => {
    expect(getSpacesWithinDistance(standardBoard, "E-5", -1)).toEqual(new Set(["E-5"]));
  });

  it("given distance 1 from interior, returns start plus eight neighbors", () => {
    const result = getSpacesWithinDistance(standardBoard, "E-5", 1);
    expect(result).toEqual(
      new Set(["E-5", "D-4", "D-5", "D-6", "E-4", "E-6", "F-4", "F-5", "F-6"]),
    );
    expect(result.size).toBe(9);
  });

  it("given distance 2 from interior, includes two-step ring", () => {
    const result = getSpacesWithinDistance(standardBoard, "E-5", 2);
    expect(result.has("E-5")).toBe(true);
    expect(result.has("D-5")).toBe(true);
    expect(result.has("C-5")).toBe(true);
    expect(result.has("D-4")).toBe(true);
    expect(result.has("C-3")).toBe(true);
    expect(result.has("C-4")).toBe(true);
    expect(result.size).toBeGreaterThan(9);
  });

  it("given distance 1 from corner, returns only in-bounds neighbors", () => {
    const result = getSpacesWithinDistance(standardBoard, "A-1", 1);
    expect(result.has("A-1")).toBe(true);
    expect(result.has("A-2")).toBe(true);
    expect(result.has("B-1")).toBe(true);
    expect(result.has("B-2")).toBe(true);
    expect(result.size).toBe(4);
  });

  it("given distance 1 from edge, returns six neighbors", () => {
    const result = getSpacesWithinDistance(standardBoard, "A-5", 1);
    expect(result.has("A-5")).toBe(true);
    expect(result.has("A-4")).toBe(true);
    expect(result.has("A-6")).toBe(true);
    expect(result.has("B-4")).toBe(true);
    expect(result.has("B-5")).toBe(true);
    expect(result.has("B-6")).toBe(true);
    expect(result.size).toBe(6);
  });

  it("given distance 3 from interior, includes third ring", () => {
    const result = getSpacesWithinDistance(standardBoard, "E-5", 3);
    expect(result.has("E-5")).toBe(true);
    expect(result.has("D-5")).toBe(true);
    expect(result.has("C-5")).toBe(true);
    expect(result.has("B-5")).toBe(true);
    expect(result.size).toBeGreaterThan(20);
  });

  it("given distance 2, excludes tiles beyond 2 steps", () => {
    const result = getSpacesWithinDistance(standardBoard, "E-5", 2);
    expect(result.has("B-5")).toBe(false);
    expect(result.has("C-5")).toBe(true);
  });

  it("given different starts, neighbor counts match position (center vs corner)", () => {
    const result1 = getSpacesWithinDistance(standardBoard, "F-6", 1);
    expect(result1.has("F-6")).toBe(true);
    expect(result1.size).toBe(9);

    const result2 = getSpacesWithinDistance(standardBoard, "L-18", 1);
    expect(result2.has("L-18")).toBe(true);
    expect(result2.size).toBe(4);
  });
});
