import type { StandardBoardCoordinate, UnitFacing } from "@entities";
import { getOppositeFacing } from "@queries/facings";
import { createBoardWithEngagedUnits, createBoardWithUnits, createTestUnit } from "@testing";
import { createEmptyStandardBoard } from "@transforms";
import { describe, expect, it } from "vitest";
import { getPlayerUnitWithPosition } from "./getPlayerUnitWithPosition";

/**
 * getPlayerUnitWithPosition: unit + placement at a coordinate for a player (single or engaged slot).
 */
describe("getPlayerUnitWithPosition", () => {
  const coordinate: StandardBoardCoordinate = "E-5";

  describe("empty space", () => {
    it("given empty space, returns undefined", () => {
      const board = createEmptyStandardBoard();
      const result = getPlayerUnitWithPosition(board, coordinate, "black");

      expect(result).toBeUndefined();
    });
  });

  describe("single unit presence", () => {
    it("given single friendly unit, returns placement", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const board = createBoardWithUnits([{ unit, coordinate, facing: "north" }]);

      const result = getPlayerUnitWithPosition(board, coordinate, "black");

      expect(result).toBeDefined();
      expect(result?.unit).toBe(unit);
      expect(result?.placement.coordinate).toBe(coordinate);
      expect(result?.placement.facing).toBe("north");
    });

    it("given single enemy unit only, returns undefined", () => {
      const enemyUnit = createTestUnit("white", { attack: 3 });
      const board = createBoardWithUnits([{ unit: enemyUnit, coordinate, facing: "north" }]);

      const result = getPlayerUnitWithPosition(board, coordinate, "black");

      expect(result).toBeUndefined();
    });

    it("given different facings, returns the unit with correct facing", () => {
      const facings: UnitFacing[] = [
        "north",
        "northEast",
        "east",
        "southEast",
        "south",
        "southWest",
        "west",
        "northWest",
      ];

      for (const facing of facings) {
        const unit = createTestUnit("black", { attack: 3 });
        const board = createBoardWithUnits([{ unit, coordinate, facing }]);

        const result = getPlayerUnitWithPosition(board, coordinate, "black");

        expect(result).toBeDefined();
        expect(result?.placement.facing).toBe(facing);
      }
    });

    it("given context, returns the unit with correct coordinate", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const testCoordinate: StandardBoardCoordinate = "A-1";
      const board = createBoardWithUnits([{ unit, coordinate: testCoordinate, facing: "north" }]);

      const result = getPlayerUnitWithPosition(board, testCoordinate, "black");

      expect(result).toBeDefined();
      expect(result?.placement.coordinate).toBe(testCoordinate);
    });
  });

  describe("engaged unit presence", () => {
    it("given primary is friendly, returns the primary unit", () => {
      const primaryUnit = createTestUnit("black", { attack: 3 });
      const secondaryUnit = createTestUnit("white", { attack: 3 });
      const board = createBoardWithEngagedUnits(primaryUnit, secondaryUnit, coordinate, "north");

      const result = getPlayerUnitWithPosition(board, coordinate, "black");

      expect(result).toBeDefined();
      expect(result?.unit).toBe(primaryUnit);
      expect(result?.placement.coordinate).toBe(coordinate);
      expect(result?.placement.facing).toBe("north");
    });

    it("given secondary is friendly, returns the secondary unit", () => {
      const primaryUnit = createTestUnit("white", { attack: 3 });
      const secondaryUnit = createTestUnit("black", { attack: 3 });
      const board = createBoardWithEngagedUnits(primaryUnit, secondaryUnit, coordinate, "north");

      const result = getPlayerUnitWithPosition(board, coordinate, "black");

      expect(result).toBeDefined();
      expect(result?.unit).toBe(secondaryUnit);
      expect(result?.placement.coordinate).toBe(coordinate);
      expect(result?.placement.facing).toBe("south"); // Secondary faces opposite primary
    });

    it("given context, returns secondary unit with correct opposite facing", () => {
      const primaryUnit = createTestUnit("white", { attack: 3 });
      const secondaryUnit = createTestUnit("black", { attack: 3 });
      const primaryFacing: UnitFacing = "east";
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        primaryFacing,
      );

      const result = getPlayerUnitWithPosition(board, coordinate, "black");

      expect(result).toBeDefined();
      expect(result?.unit).toBe(secondaryUnit);
      expect(result?.placement.facing).toBe("west"); // Opposite of east
    });

    it("given handle all facings correctly for engaged units", () => {
      const facings: UnitFacing[] = [
        "north",
        "northEast",
        "east",
        "southEast",
        "south",
        "southWest",
        "west",
        "northWest",
      ];

      for (const primaryFacing of facings) {
        const primaryUnit = createTestUnit("white", { attack: 3 });
        const secondaryUnit = createTestUnit("black", { attack: 3 });
        const board = createBoardWithEngagedUnits(
          primaryUnit,
          secondaryUnit,
          coordinate,
          primaryFacing,
        );

        const result = getPlayerUnitWithPosition(board, coordinate, "black");

        expect(result).toBeDefined();
        expect(result?.unit).toBe(secondaryUnit);
        // The facing should be opposite of primary
        const expectedFacing = getOppositeFacing(primaryFacing);
        expect(result?.placement.facing).toBe(expectedFacing);
      }
    });
  });

  describe("different player sides", () => {
    it("given black unit is present, returns unit for black player", () => {
      const blackUnit = createTestUnit("black", { attack: 3 });
      const board = createBoardWithUnits([{ unit: blackUnit, coordinate, facing: "north" }]);

      const result = getPlayerUnitWithPosition(board, coordinate, "black");

      expect(result).toBeDefined();
      expect(result?.unit.playerSide).toBe("black");
    });

    it("given white unit is present, returns unit for white player", () => {
      const whiteUnit = createTestUnit("white", { attack: 3 });
      const board = createBoardWithUnits([{ unit: whiteUnit, coordinate, facing: "north" }]);

      const result = getPlayerUnitWithPosition(board, coordinate, "white");

      expect(result).toBeDefined();
      expect(result?.unit.playerSide).toBe("white");
    });

    it("given only white unit is present, returns undefined for black player", () => {
      const whiteUnit = createTestUnit("white", { attack: 3 });
      const board = createBoardWithUnits([{ unit: whiteUnit, coordinate, facing: "north" }]);

      const result = getPlayerUnitWithPosition(board, coordinate, "black");

      expect(result).toBeUndefined();
    });

    it("given only black unit is present, returns undefined for white player", () => {
      const blackUnit = createTestUnit("black", { attack: 3 });
      const board = createBoardWithUnits([{ unit: blackUnit, coordinate, facing: "north" }]);

      const result = getPlayerUnitWithPosition(board, coordinate, "white");

      expect(result).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("given handle different coordinates correctly", () => {
      const coordinates: StandardBoardCoordinate[] = ["A-1", "A-18", "L-1", "L-18", "E-5"];

      for (const coord of coordinates) {
        const unit = createTestUnit("black", { attack: 3 });
        const board = createBoardWithUnits([{ unit, coordinate: coord, facing: "north" }]);

        const result = getPlayerUnitWithPosition(board, coord, "black");

        expect(result).toBeDefined();
        expect(result?.placement.coordinate).toBe(coord);
      }
    });

    it("given checking wrong coordinate, returns undefined", () => {
      const unit = createTestUnit("black", { attack: 3 });
      const board = createBoardWithUnits([{ unit, coordinate: "E-5", facing: "north" }]);

      const result = getPlayerUnitWithPosition(board, "A-1", "black");

      expect(result).toBeUndefined();
    });

    it("given when space is invalid, throws", () => {
      const board = createEmptyStandardBoard();
      expect(() =>
        getPlayerUnitWithPosition(board, "invalid" as StandardBoardCoordinate, "black"),
      ).toThrow(new Error("Coordinate invalid does not exist on standard board."));
    });
  });
});
