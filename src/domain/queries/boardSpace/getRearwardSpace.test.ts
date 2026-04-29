import type { StandardBoard, StandardBoardCoordinate, UnitFacing } from "@entities";
import { createEmptyStandardBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { getRearwardSpace } from "./getRearwardSpace";

const standardBoard: StandardBoard = createEmptyStandardBoard();

/**
 * getRearwardSpace: one step backward from a coordinate along the facing (opposite forward); undefined off board;
 * throws on invalid coordinate or facing.
 */
describe("getRearwardSpace", () => {
  it("given facing north at E-5, returns F-5", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "north")).toBe("F-5");
  });
  it("given facing east at E-5, returns E-4", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "east")).toBe("E-4");
  });
  it("given facing south at E-5, returns D-5", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "south")).toBe("D-5");
  });
  it("given facing west at E-5, returns E-6", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "west")).toBe("E-6");
  });

  it("given facing northEast at E-5, returns F-4", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "northEast")).toBe("F-4");
  });
  it("given facing southEast at E-5, returns D-4", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "southEast")).toBe("D-4");
  });
  it("given facing southWest at E-5, returns D-6", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "southWest")).toBe("D-6");
  });
  it("given facing northWest at E-5, returns F-6", () => {
    expect(getRearwardSpace(standardBoard, "E-5", "northWest")).toBe("F-6");
  });

  it("given facing south at A-1, returns undefined", () => {
    expect(getRearwardSpace(standardBoard, "A-1", "south")).toBeUndefined();
  });
  it("given facing east at F-1, returns undefined", () => {
    expect(getRearwardSpace(standardBoard, "F-1", "east")).toBeUndefined();
  });
  it("given facing north at L-5, returns undefined", () => {
    expect(getRearwardSpace(standardBoard, "L-5", "north")).toBeUndefined();
  });
  it("given facing west at E-18, returns undefined", () => {
    expect(getRearwardSpace(standardBoard, "E-18", "west")).toBeUndefined();
  });

  it("given facing southWest at A-1, returns undefined", () => {
    expect(getRearwardSpace(standardBoard, "A-1", "southWest")).toBeUndefined();
  });
  it("given facing southEast at A-18, returns undefined", () => {
    expect(getRearwardSpace(standardBoard, "A-18", "southEast")).toBeUndefined();
  });
  it("given facing northWest at L-1, returns undefined", () => {
    expect(getRearwardSpace(standardBoard, "L-1", "northWest")).toBeUndefined();
  });
  it("given facing northEast at L-18, returns undefined", () => {
    expect(getRearwardSpace(standardBoard, "L-18", "northEast")).toBeUndefined();
  });

  it("given invalid row letter, throws", () => {
    expect(() =>
      getRearwardSpace(standardBoard, "R-12" as StandardBoardCoordinate, "north"),
    ).toThrow(new Error("Invalid row: R"));
  });

  it("given invalid column, throws", () => {
    expect(() =>
      getRearwardSpace(standardBoard, "A-19" as StandardBoardCoordinate, "north"),
    ).toThrow(new Error("Invalid column: 19"));
  });

  it("given invalid facing, throws", () => {
    expect(() => getRearwardSpace(standardBoard, "E-9", "random" as UnitFacing)).toThrow(
      new Error("Invalid facing: random"),
    );
  });
});
