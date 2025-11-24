import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { describe, expect, it } from "vitest";
import { getForwardSpace } from "./getForwardSpace.js";

describe("getForwardSpace", () => {
  it("should return the forward space for orthogonal facing directions", () => {
    expect(getForwardSpace("A1", "south")).toBe("B1");
    expect(getForwardSpace("A1", "east")).toBe("A2");
    expect(getForwardSpace("E5", "west")).toBe("E4");
    expect(getForwardSpace("G10", "north")).toBe("F10");
  });

  it("should return the forward space for diagonal facing directions", () => {
    expect(getForwardSpace("A1", "southEast")).toBe("B2");
    expect(getForwardSpace("D4", "southWest")).toBe("E3");
    expect(getForwardSpace("K11", "northEast")).toBe("J12");
    expect(getForwardSpace("L18", "northWest")).toBe("K17");
  });

  it("should return undefined if the forward orthogonal space is out of bounds", () => {
    expect(getForwardSpace("A1", "north")).toBeUndefined();
    expect(getForwardSpace("F1", "west")).toBeUndefined();
    expect(getForwardSpace("L5", "south")).toBeUndefined();
    expect(getForwardSpace("E18", "east")).toBeUndefined();
  });

  it("should return undefined if the forward diagonal space is out of bounds", () => {
    expect(getForwardSpace("A1", "northWest")).toBeUndefined();
    expect(getForwardSpace("A18", "northEast")).toBeUndefined();
    expect(getForwardSpace("L1", "southWest")).toBeUndefined();
    expect(getForwardSpace("L18", "southEast")).toBeUndefined();
    expect(getForwardSpace("F1", "northWest")).toBeUndefined();
    expect(getForwardSpace("E18", "northEast")).toBeUndefined();
    expect(getForwardSpace("L5", "southWest")).toBeUndefined();
    expect(getForwardSpace("E1", "northWest")).toBeUndefined();
  });

  it("should throw an error if the row is invalid", () => {
    expect(() =>
      getForwardSpace("R12" as StandardBoardCoordinate, "north")
    ).toThrow(new Error("Invalid row: R"));
  });

  it("should throw an error if the column is invalid", () => {
    expect(() =>
      getForwardSpace("A19" as StandardBoardCoordinate, "north")
    ).toThrow(new Error("Invalid column: 19"));
  });

  it("should throw an error if the facing is invalid", () => {
    expect(() => getForwardSpace("E9", "random" as UnitFacing)).toThrow(
      new Error("Invalid facing: random")
    );
  });
});
