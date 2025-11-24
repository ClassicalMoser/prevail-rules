import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { describe, expect, it } from "vitest";
import { getRearwardSpace } from "./getRearwardSpace.js";

describe("getRearwardSpace", () => {
  it("should return the rearward space for orthogonal facing directions", () => {
    expect(getRearwardSpace("E5", "north")).toBe("F5");
    expect(getRearwardSpace("E5", "east")).toBe("E4");
    expect(getRearwardSpace("E5", "south")).toBe("D5");
    expect(getRearwardSpace("E5", "west")).toBe("E6");
  });

  it("should return the rearward space for diagonal facing directions", () => {
    expect(getRearwardSpace("E5", "northEast")).toBe("F4");
    expect(getRearwardSpace("E5", "southEast")).toBe("D4");
    expect(getRearwardSpace("E5", "southWest")).toBe("D6");
    expect(getRearwardSpace("E5", "northWest")).toBe("F6");
  });

  it("should return undefined if the rearward space is out of bounds", () => {
    expect(getRearwardSpace("A1", "south")).toBeUndefined();
    expect(getRearwardSpace("F1", "east")).toBeUndefined();
    expect(getRearwardSpace("L5", "north")).toBeUndefined();
    expect(getRearwardSpace("E18", "west")).toBeUndefined();
  });

  it("should return undefined if the rearward diagonal space is out of bounds", () => {
    expect(getRearwardSpace("A1", "southWest")).toBeUndefined();
    expect(getRearwardSpace("A18", "southEast")).toBeUndefined();
    expect(getRearwardSpace("L1", "northWest")).toBeUndefined();
    expect(getRearwardSpace("L18", "northEast")).toBeUndefined();
  });

  it("should throw an error if the row is invalid", () => {
    expect(() =>
      getRearwardSpace("R12" as StandardBoardCoordinate, "north")
    ).toThrow(new Error("Invalid row: R"));
  });

  it("should throw an error if the column is invalid", () => {
    expect(() =>
      getRearwardSpace("A19" as StandardBoardCoordinate, "north")
    ).toThrow(new Error("Invalid column: 19"));
  });

  it("should throw an error if the facing is invalid", () => {
    expect(() => getRearwardSpace("E9", "random" as UnitFacing)).toThrow(
      new Error("Invalid facing: random")
    );
  });
});

