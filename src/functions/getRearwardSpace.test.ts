import type { StandardBoard } from "src/entities/board/standardBoard/index.js";
import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { describe, expect, it } from "vitest";
import { createEmptyStandardBoard } from "./createEmptyBoard.js";
import { getRearwardSpace } from "./getRearwardSpace.js";

const standardBoard: StandardBoard = createEmptyStandardBoard();

describe("getRearwardSpace", () => {
  it("should return the rearward space when facing north from E5", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "north")).toBe("F-5");
  });
  it("should return the rearward space when facing east from E5", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "east")).toBe("E-4");
  });
  it("should return the rearward space when facing south from E5", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "south")).toBe("D-5");
  });
  it("should return the rearward space when facing west from E5", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "west")).toBe("E-6");
  });

  it("should return the rearward space when facing northEast from E5", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "northEast")).toBe("F-4");
  });
  it("should return the rearward space when facing southEast from E5", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "southEast")).toBe("D-4");
  });
  it("should return the rearward space when facing southWest from E5", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "southWest")).toBe("D-6");
  });
  it("should return the rearward space when facing northWest from E5", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "northWest")).toBe("F-6");
  });

  it("should return undefined when facing south from A1 (out of bounds)", () => {
    expect(getRearwardSpace(standardBoard, "A-1", "south")).toBeUndefined();
  });
  it("should return undefined when facing east from F1 (out of bounds)", () => {
    expect(getRearwardSpace(standardBoard, "F-1", "east")).toBeUndefined();
  });
  it("should return undefined when facing north from L5 (out of bounds)", () => {
    expect(getRearwardSpace(standardBoard, "L-5", "north")).toBeUndefined();
  });
  it("should return undefined when facing west from E18 (out of bounds)", () => {
    expect(getRearwardSpace(standardBoard, "E-18", "west")).toBeUndefined();
  });

  it("should return undefined when facing southWest from A1 (out of bounds)", () => {
    expect(getRearwardSpace(standardBoard, "A-1", "southWest")).toBeUndefined();
  });
  it("should return undefined when facing southEast from A18 (out of bounds)", () => {
    expect(
      getRearwardSpace(standardBoard, "A-18", "southEast"),
    ).toBeUndefined();
  });
  it("should return undefined when facing northWest from L1 (out of bounds)", () => {
    expect(getRearwardSpace(standardBoard, "L-1", "northWest")).toBeUndefined();
  });
  it("should return undefined when facing northEast from L18 (out of bounds)", () => {
    expect(
      getRearwardSpace(standardBoard, "L-18", "northEast"),
    ).toBeUndefined();
  });

  it("should throw an error if the row is invalid", () => {
    expect(() =>
      getRearwardSpace(
        standardBoard,
        "R-12" as StandardBoardCoordinate,
        "north",
      ),
    ).toThrow(new Error("Invalid row: R"));
  });

  it("should throw an error if the column is invalid", () => {
    expect(() =>
      getRearwardSpace(
        standardBoard,
        "A-19" as StandardBoardCoordinate,
        "north",
      ),
    ).toThrow(new Error("Invalid column: 19"));
  });

  it("should throw an error if the facing is invalid", () => {
    expect(() =>
      getRearwardSpace(standardBoard, "E-9", "random" as UnitFacing),
    ).toThrow(new Error("Invalid facing: random"));
  });
});
