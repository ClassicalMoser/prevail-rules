import type { StandardBoard } from "src/entities/board/standardBoard/index.js";
import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { describe, expect, it } from "vitest";
import { createEmptyStandardBoard } from "../createEmptyBoard.js";
import { getLeftSpace } from "./getLeftSpace.js";

const standardBoard: StandardBoard = createEmptyStandardBoard();

describe("getLeftSpace", () => {
  it("should return the left space when facing north from E5", () => {
    expect(getLeftSpace(standardBoard, "E-5", "north")).toBe("E-4");
  });
  it("should return the left space when facing east from E5", () => {
    expect(getLeftSpace(standardBoard, "E-5", "east")).toBe("D-5");
  });
  it("should return the left space when facing south from E5", () => {
    expect(getLeftSpace(standardBoard, "E-5", "south")).toBe("E-6");
  });
  it("should return the left space when facing west from E5", () => {
    expect(getLeftSpace(standardBoard, "E-5", "west")).toBe("F-5");
  });

  it("should return the left space when facing northEast from E5", () => {
    expect(getLeftSpace(standardBoard, "E-5", "northEast")).toBe("D-4");
  });
  it("should return the left space when facing southEast from E5", () => {
    expect(getLeftSpace(standardBoard, "E-5", "southEast")).toBe("D-6");
  });
  it("should return the left space when facing southWest from E5", () => {
    expect(getLeftSpace(standardBoard, "E-5", "southWest")).toBe("F-6");
  });
  it("should return the left space when facing northWest from E5", () => {
    expect(getLeftSpace(standardBoard, "E-5", "northWest")).toBe("F-4");
  });

  it("should return undefined when facing north from E1 (out of bounds)", () => {
    expect(getLeftSpace(standardBoard, "E-1", "north")).toBeUndefined();
  });
  it("should return undefined when facing east from A5 (out of bounds)", () => {
    expect(getLeftSpace(standardBoard, "A-5", "east")).toBeUndefined();
  });
  it("should return undefined when facing south from E18 (out of bounds)", () => {
    expect(getLeftSpace(standardBoard, "E-18", "south")).toBeUndefined();
  });
  it("should return undefined when facing west from L5 (out of bounds)", () => {
    expect(getLeftSpace(standardBoard, "L-5", "west")).toBeUndefined();
  });

  it("should return undefined when facing northEast from A1 (out of bounds)", () => {
    expect(getLeftSpace(standardBoard, "A-1", "northEast")).toBeUndefined();
  });
  it("should return undefined when facing southEast from A18 (out of bounds)", () => {
    expect(getLeftSpace(standardBoard, "A-18", "southEast")).toBeUndefined();
  });
  it("should return undefined when facing southWest from L1 (out of bounds)", () => {
    expect(getLeftSpace(standardBoard, "L-1", "southWest")).toBeUndefined();
  });
  it("should return undefined when facing northWest from L18 (out of bounds)", () => {
    expect(getLeftSpace(standardBoard, "L-18", "northWest")).toBeUndefined();
  });

  it("should throw an error if the row is invalid", () => {
    expect(() =>
      getLeftSpace(standardBoard, "R-12" as StandardBoardCoordinate, "north"),
    ).toThrow(new Error("Invalid row: R"));
  });

  it("should throw an error if the column is invalid", () => {
    expect(() =>
      getLeftSpace(standardBoard, "A-19" as StandardBoardCoordinate, "north"),
    ).toThrow(new Error("Invalid column: 19"));
  });

  it("should throw an error if the facing is invalid", () => {
    expect(() =>
      getLeftSpace(standardBoard, "E-9", "random" as UnitFacing),
    ).toThrow(new Error("Invalid facing: random"));
  });
});
