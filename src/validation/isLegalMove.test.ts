import type { MoveUnitCommand } from "src/commands/moveUnit.js";
import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitInstance,
} from "src/entities/index.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { tempUnits } from "src/sampleValues/tempUnits.js";
import { createUnitInstance } from "src/utils/createUnitInstance.js";
import { describe, expect, it } from "vitest";
import { createEmptyStandardBoard } from "../functions/createEmptyBoard.js";
import { isLegalMove } from "./isLegalMove.js";

describe("isLegalMove", () => {
  const spearmenUnitType = tempUnits.find((unit) => unit.name === "Spearmen");
  if (!spearmenUnitType) {
    throw new Error("Spearmen unit type not found");
  }

  // Helper function to create a board with units at specified positions
  function createBoardWithUnits(
    units: Array<{
      unit: UnitInstance;
      coordinate: StandardBoardCoordinate;
      facing: UnitFacing;
    }>
  ): StandardBoard {
    const board = createEmptyStandardBoard();
    for (const { unit, coordinate, facing } of units) {
      board.board[coordinate] = {
        ...board.board[coordinate],
        unitPresence: {
          presenceType: "single",
          unit,
          facing,
        },
      };
    }
    return board;
  }

  describe("valid moves", () => {
    it("should return true for staying in place", () => {
      const unit = createUnitInstance("black", spearmenUnitType, 1);
      const coordinate: StandardBoardCoordinate = "E-5";
      const facing: UnitFacing = "north";
      const board = createBoardWithUnits([{ unit, coordinate, facing }]);

      const moveCommand: MoveUnitCommand = {
        player: "black",
        unit,
        from: { coordinate, facing },
        to: { coordinate, facing },
      };

      expect(isLegalMove(moveCommand, board)).toBe(true);
    });

    it("should return true for moving forward", () => {
      const unit = createUnitInstance("black", spearmenUnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = "E-5";
      const toCoordinate: StandardBoardCoordinate = "D-5";
      const facing: UnitFacing = "north";
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
      ]);

      const moveCommand: MoveUnitCommand = {
        player: "black",
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveCommand, board)).toBe(true);
    });

    it("should return true for changing facing without moving", () => {
      const unit = createUnitInstance("black", spearmenUnitType, 1);
      const coordinate: StandardBoardCoordinate = "E-5";
      const fromFacing: UnitFacing = "north";
      const toFacing: UnitFacing = "east";
      const board = createBoardWithUnits([
        { unit, coordinate, facing: fromFacing },
      ]);

      const moveCommand: MoveUnitCommand = {
        player: "black",
        unit,
        from: { coordinate, facing: fromFacing },
        to: { coordinate, facing: toFacing },
      };

      expect(isLegalMove(moveCommand, board)).toBe(true);
    });

    it("should return true for engaging enemy from flank", () => {
      const unit = createUnitInstance("black", spearmenUnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = "E-4";
      const toCoordinate: StandardBoardCoordinate = "E-5";
      const facing: UnitFacing = "east";
      const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
        { unit: enemyUnit, coordinate: toCoordinate, facing: "north" },
      ]);

      const moveCommand: MoveUnitCommand = {
        player: "black",
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveCommand, board)).toBe(true);
    });

    it("should return true for engaging enemy from front with correct facing", () => {
      const unit = createUnitInstance("black", spearmenUnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = "D-5";
      const toCoordinate: StandardBoardCoordinate = "E-5";
      const facing: UnitFacing = "south"; // Facing opposite to enemy (enemy faces north)
      const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
        { unit: enemyUnit, coordinate: toCoordinate, facing: "north" },
      ]);

      const moveCommand: MoveUnitCommand = {
        player: "black",
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveCommand, board)).toBe(true);
    });
  });

  describe("invalid moves", () => {
    it("should return false for moving to invalid coordinate", () => {
      const unit = createUnitInstance("black", spearmenUnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = "E-5";
      // Invalid coordinate with intentionally unsafe casting
      const toCoordinate: StandardBoardCoordinate =
        "Z-99" as StandardBoardCoordinate;
      const facing: UnitFacing = "north";
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
      ]);

      const moveCommand: MoveUnitCommand = {
        player: "black",
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate as StandardBoardCoordinate, facing },
      };

      expect(isLegalMove(moveCommand, board)).toBe(false);
    });

    it("should return false for moving beyond speed limit", () => {
      const unit = createUnitInstance("black", spearmenUnitType, 1); // Speed 2
      const fromCoordinate: StandardBoardCoordinate = "E-5";
      const toCoordinate: StandardBoardCoordinate = "B-5"; // 3 spaces away (beyond speed 2)
      const facing: UnitFacing = "north";
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
      ]);

      const moveCommand: MoveUnitCommand = {
        player: "black",
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveCommand, board)).toBe(false);
    });

    it("should return false for moving to friendly unit", () => {
      const unit = createUnitInstance("black", spearmenUnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = "E-5";
      const toCoordinate: StandardBoardCoordinate = "D-5";
      const facing: UnitFacing = "north";
      const friendlyUnit = createUnitInstance("black", spearmenUnitType, 2);
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
        { unit: friendlyUnit, coordinate: toCoordinate, facing },
      ]);

      const moveCommand: MoveUnitCommand = {
        player: "black",
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveCommand, board)).toBe(false);
    });

    it("should return false for moving through enemy unit", () => {
      const unit = createUnitInstance("black", spearmenUnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = "E-5";
      const toCoordinate: StandardBoardCoordinate = "C-5"; // Beyond enemy at D-5
      const facing: UnitFacing = "north";
      const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
        { unit: enemyUnit, coordinate: "D-5", facing: "south" },
      ]);

      const moveCommand: MoveUnitCommand = {
        player: "black",
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveCommand, board)).toBe(false);
    });

    it("should return false for engaging enemy from front with wrong facing", () => {
      const unit = createUnitInstance("black", spearmenUnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = "D-5";
      const toCoordinate: StandardBoardCoordinate = "E-5";
      const facing: UnitFacing = "north"; // Wrong facing (should be south to face opposite enemy)
      const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
        { unit: enemyUnit, coordinate: toCoordinate, facing: "north" },
      ]);

      const moveCommand: MoveUnitCommand = {
        player: "black",
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveCommand, board)).toBe(false);
    });

    it("should return false for engaging enemy from front without flexibility to rotate", () => {
      const lowFlexibilityUnitType = tempUnits.find(
        (unit) => unit.flexibility === 1
      );
      if (!lowFlexibilityUnitType) {
        throw new Error("Unit with flexibility 0 not found");
      }
      const unit = createUnitInstance("black", lowFlexibilityUnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = "D-5";
      const toCoordinate: StandardBoardCoordinate = "E-5";
      const facing: UnitFacing = "east"; // Coming from angle, needs flexibility to rotate
      const enemyUnit = createUnitInstance("white", spearmenUnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
        { unit: enemyUnit, coordinate: toCoordinate, facing: "north" },
      ]);

      const moveCommand: MoveUnitCommand = {
        player: "black",
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveCommand, board)).toBe(false);
    });
  });
});
