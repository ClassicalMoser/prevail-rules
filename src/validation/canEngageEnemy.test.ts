import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
  UnitInstance,
} from "src/entities/index.js";
import type { PlayerSide } from "src/entities/player/playerSide.js";
import { getUnitByStatValue } from "src/utils/getUnitByStatValue.js";
import { describe, expect, it } from "vitest";
import { createEmptyStandardBoard } from "../functions/createEmptyBoard.js";
import { canEngageEnemy } from "./canEngageEnemy.js";

describe("canEngageEnemy", () => {
  const standardBoard: StandardBoard = createEmptyStandardBoard();
  const enemyCoordinate: StandardBoardCoordinate = "E-5";

  // Helper function to create a unit instance with a specific player side
  const createUnitInstance = (playerSide: PlayerSide): UnitInstance => {
    const unitType = getUnitByStatValue("attack", 3);
    if (!unitType) {
      throw new Error(`No unit found with attack value 3.`);
    }
    return { playerSide, unitType, instanceNumber: 1 };
  };

  // Helper function to create a board with an enemy unit at a coordinate
  function createBoardWithEnemyUnit(
    coord: StandardBoardCoordinate = enemyCoordinate,
    enemyPlayerSide: PlayerSide,
    enemyFacing: UnitFacing = "north"
  ): StandardBoard {
    const board = createEmptyStandardBoard();
    board.board[coord] = {
      ...board.board[coord],
      unitPresence: {
        presenceType: "single",
        unit: createUnitInstance(enemyPlayerSide),
        facing: enemyFacing,
      },
    };
    return board;
  }

  describe("invalid inputs", () => {
    it("should return false for a non-existent destination coordinate", () => {
      const unit = createUnitInstance("black");
      const invalidCoordinate = "Z-99" as StandardBoardCoordinate;
      const adjacentCoordinate: StandardBoardCoordinate = "E-4";
      expect(
        canEngageEnemy(
          unit,
          standardBoard,
          invalidCoordinate,
          "north",
          adjacentCoordinate,
          1,
          adjacentCoordinate
        )
      ).toBe(false);
    });

    it("should return false for a non-existent adjacent coordinate", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white");
      const invalidCoordinate = "Z-99" as StandardBoardCoordinate;
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "north",
          invalidCoordinate,
          1,
          invalidCoordinate
        )
      ).toBe(false);
    });
  });

  describe("not an enemy space", () => {
    it("should return false for an empty space", () => {
      const unit = createUnitInstance("black");
      const adjacentCoordinate: StandardBoardCoordinate = "E-4";
      expect(
        canEngageEnemy(
          unit,
          standardBoard,
          enemyCoordinate,
          "north",
          adjacentCoordinate,
          1,
          adjacentCoordinate
        )
      ).toBe(false);
    });

    it("should return false for a friendly unit", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "black");
      const adjacentCoordinate: StandardBoardCoordinate = "E-4";
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "south",
          adjacentCoordinate,
          1,
          adjacentCoordinate
        )
      ).toBe(false);
    });
  });

  describe("coming from flank", () => {
    it("should return true when coming from a flank space", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white", "north");
      // E-5 is enemy facing north, so E-4 (west) and E-6 (east) are flank spaces
      const flankCoordinate: StandardBoardCoordinate = "E-4";
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "east",
          flankCoordinate,
          0,
          flankCoordinate
        )
      ).toBe(true);
    });

    it("should return true when coming from a flank space with any facing", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white", "north");
      const flankCoordinate: StandardBoardCoordinate = "E-6";
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "southWest",
          flankCoordinate,
          0,
          flankCoordinate
        )
      ).toBe(true);
    });
  });

  describe("coming from back", () => {
    it("should return true when coming from back and started behind enemy", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white", "north");
      // E-5 is enemy facing north, so F-5 is directly behind
      const backCoordinate: StandardBoardCoordinate = "F-5";
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "north",
          backCoordinate,
          0,
          backCoordinate
        )
      ).toBe(true);
    });

    it("should return false when coming from back but didn't start behind enemy", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white", "north");
      // F-6 is a back space
      const backCoordinate: StandardBoardCoordinate = "F-6";
      // Started at C-8, which is not behind the enemy
      const startCoordinate: StandardBoardCoordinate = "C-8";
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "southEast",
          backCoordinate,
          0,
          startCoordinate
        )
      ).toBe(false);
    });

    it("should return true when coming from back diagonal and started behind enemy", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white", "north");
      // F-6 is a back diagonal space
      const backCoordinate: StandardBoardCoordinate = "F-6";
      // Started at G-7, which is behind the enemy (southEast of enemy facing north)
      const startCoordinate: StandardBoardCoordinate = "G-7";
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "northWest",
          backCoordinate,
          0,
          startCoordinate
        )
      ).toBe(true);
    });
  });

  describe("coming from front", () => {
    it("should return true when already facing opposite to enemy", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white", "north");
      // E-5 is enemy facing north, so D-5 is forward space
      const frontCoordinate: StandardBoardCoordinate = "D-5";
      // Facing south (opposite of north)
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "south",
          frontCoordinate,
          0,
          frontCoordinate
        )
      ).toBe(true);
    });

    it("should return true when need to rotate and have flexibility", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white", "north");
      const frontCoordinate: StandardBoardCoordinate = "D-4";
      // Facing southEast, need to rotate to south, have flexibility
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "southEast",
          frontCoordinate,
          1,
          frontCoordinate
        )
      ).toBe(true);
    });

    it("should return false when need to rotate but no flexibility", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white", "north");
      const frontCoordinate: StandardBoardCoordinate = "D-4";
      // Facing southEast, need to rotate to south, but no flexibility
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "southEast",
          frontCoordinate,
          0,
          frontCoordinate
        )
      ).toBe(false);
    });

    it("should handle diagonal front spaces", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white", "north");
      // F-5 is a front space
      const frontDiagonalCoordinate: StandardBoardCoordinate = "D-4";
      // Facing south (opposite of north)
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "southEast",
          frontDiagonalCoordinate,
          2,
          frontDiagonalCoordinate
        )
      ).toBe(true);
    });

    it("should handle different enemy facings", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white", "east");
      // E-5 is enemy facing east, so E-6 is front space
      const frontCoordinate: StandardBoardCoordinate = "E-6";
      // Facing west (opposite of east)
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "west",
          frontCoordinate,
          0,
          frontCoordinate
        )
      ).toBe(true);
    });
  });

  describe("not adjacent to enemy", () => {
    it("should return false when not adjacent to enemy", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white", "north");
      // G-5 is not adjacent to E-5
      const nonAdjacentCoordinate: StandardBoardCoordinate = "G-5";
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "north",
          nonAdjacentCoordinate,
          1,
          nonAdjacentCoordinate
        )
      ).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should work with white player units", () => {
      const unit = createUnitInstance("white");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "black", "north");
      const flankCoordinate: StandardBoardCoordinate = "E-4";
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "east",
          flankCoordinate,
          0,
          flankCoordinate
        )
      ).toBe(true);
    });

    it("should handle multiple flexibility values", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithEnemyUnit(enemyCoordinate, "white", "north");
      const frontCoordinate: StandardBoardCoordinate = "D-4";
      // Needs to rotate, has 2 flexibility
      expect(
        canEngageEnemy(
          unit,
          board,
          enemyCoordinate,
          "southEast",
          frontCoordinate,
          2,
          frontCoordinate
        )
      ).toBe(true);
    });
  });
});
