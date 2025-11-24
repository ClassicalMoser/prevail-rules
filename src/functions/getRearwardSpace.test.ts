import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { describe, expect, it } from "vitest";
import { getRearwardSpace } from "./getRearwardSpace.js";

describe("getRearwardSpace", () => {
  it("should return the rearward space when facing north from E5", () => {
    expect(getRearwardSpace("E5", "north")).toBe("F5");
  });
  it("should return the rearward space when facing east from E5", () => {
    expect(getRearwardSpace("E5", "east")).toBe("E4");
  });
  it("should return the rearward space when facing south from E5", () => {
    expect(getRearwardSpace("E5", "south")).toBe("D5");
  });
  it("should return the rearward space when facing west from E5", () => {
    expect(getRearwardSpace("E5", "west")).toBe("E6");
  });

  it("should return the rearward space when facing northEast from E5", () => {
    expect(getRearwardSpace("E5", "northEast")).toBe("F4");
  });
  it("should return the rearward space when facing southEast from E5", () => {
    expect(getRearwardSpace("E5", "southEast")).toBe("D4");
  });
  it("should return the rearward space when facing southWest from E5", () => {
    expect(getRearwardSpace("E5", "southWest")).toBe("D6");
  });
  it("should return the rearward space when facing northWest from E5", () => {
    expect(getRearwardSpace("E5", "northWest")).toBe("F6");
  });

  it("should return undefined when facing south from A1 (out of bounds)", () => {
    expect(getRearwardSpace("A1", "south")).toBeUndefined();
  });
  it("should return undefined when facing east from F1 (out of bounds)", () => {
    expect(getRearwardSpace("F1", "east")).toBeUndefined();
  });
  it("should return undefined when facing north from L5 (out of bounds)", () => {
    expect(getRearwardSpace("L5", "north")).toBeUndefined();
  });
  it("should return undefined when facing west from E18 (out of bounds)", () => {
    expect(getRearwardSpace("E18", "west")).toBeUndefined();
  });

  it("should return undefined when facing southWest from A1 (out of bounds)", () => {
    expect(getRearwardSpace("A1", "southWest")).toBeUndefined();
  });
  it("should return undefined when facing southEast from A18 (out of bounds)", () => {
    expect(getRearwardSpace("A18", "southEast")).toBeUndefined();
  });
  it("should return undefined when facing northWest from L1 (out of bounds)", () => {
    expect(getRearwardSpace("L1", "northWest")).toBeUndefined();
  });
  it("should return undefined when facing northEast from L18 (out of bounds)", () => {
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
