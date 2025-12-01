import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitInstance,
} from "src/entities/index.js";
import type { PlayerSide } from "src/entities/player/playerSide.js";
import { getUnitByStatValue } from "src/utils/getUnitByStatValue.js";
import { describe, expect, it, vi } from "vitest";
import { createEmptyStandardBoard } from "../functions/createEmptyBoard.js";
import { canMoveInto } from "./canMoveInto.js";

describe("canMoveInto", () => {
  const standardBoard: StandardBoard = createEmptyStandardBoard();
  const coordinate: StandardBoardCoordinate = "E-5";

  // Helper function to create a unit instance with a specific player side.
  const createUnitInstance = (playerSide: PlayerSide): UnitInstance => {
    const unitType = getUnitByStatValue("attack", 3);
    if (!unitType) {
      throw new Error(`No unit found with attack value 3.`);
    }
    return { playerSide, unitType, instanceNumber: 1 };
  };

  // Helper function to create a board with a single unit at a coordinate
  function createBoardWithSingleUnit(
    coord: StandardBoardCoordinate = coordinate,
    playerSide: PlayerSide
  ): StandardBoard {
    const board = createEmptyStandardBoard();
    board.board[coord] = {
      ...board.board[coord],
      unitPresence: {
        presenceType: "single",
        unit: createUnitInstance(playerSide),
        facing: "north",
      },
    };
    return board;
  }

  // Helper function to create a board with engaged units at a coordinate
  function createBoardWithEngagedUnits(
    primaryUnit: UnitInstance,
    secondaryUnit: UnitInstance,
    coord: StandardBoardCoordinate = coordinate
  ): StandardBoard {
    const board = createEmptyStandardBoard();
    board.board[coord] = {
      ...board.board[coord],
      unitPresence: {
        presenceType: "engaged",
        primaryUnit,
        primaryFacing: "north",
        secondaryUnit,
      },
    };
    return board;
  }

  describe("invalid inputs", () => {
    it("should return false for a non-existent coordinate", () => {
      const unit = createUnitInstance("black");
      const invalidCoordinate = "Z-99" as StandardBoardCoordinate;
      expect(canMoveInto(unit, standardBoard, invalidCoordinate)).toBe(false);
    });
  });

  describe("empty space", () => {
    it("should return true for an empty space", () => {
      const unit = createUnitInstance("black");
      expect(canMoveInto(unit, standardBoard, coordinate)).toBe(true);
    });
  });

  describe("engaged space", () => {
    it("should return false for a space with two engaged units", () => {
      const unit = createUnitInstance("black");
      const primaryUnit = createUnitInstance("black");
      const secondaryUnit = createUnitInstance("white");
      const board = createBoardWithEngagedUnits(primaryUnit, secondaryUnit);
      expect(canMoveInto(unit, board, coordinate)).toBe(false);
    });
  });

  describe("single friendly unit", () => {
    it("should return false for a space with a single friendly unit", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithSingleUnit(coordinate, "black");
      expect(canMoveInto(unit, board, coordinate)).toBe(false);
    });

    it("should return false for white player with a single friendly unit", () => {
      const unit = createUnitInstance("white");
      const board = createBoardWithSingleUnit(coordinate, "white");
      expect(canMoveInto(unit, board, coordinate)).toBe(false);
    });
  });

  describe("single enemy unit", () => {
    it("should return true for a space with a single enemy unit", () => {
      const unit = createUnitInstance("black");
      const board = createBoardWithSingleUnit(coordinate, "white");
      expect(canMoveInto(unit, board, coordinate)).toBe(true);
    });

    it("should return true for white player with a single enemy unit", () => {
      const unit = createUnitInstance("white");
      const board = createBoardWithSingleUnit(coordinate, "black");
      expect(canMoveInto(unit, board, coordinate)).toBe(true);
    });
  });

  describe("edge cases and error handling", () => {
    it("should return false when coordinate is invalid (defensive check)", () => {
      // Test coverage for lines 15-16: defensive check for undefined space
      // Using invalid coordinate causes getBoardSpace to throw, which is caught and returns false
      const unit = createUnitInstance("black");
      const invalidCoordinate = "Z-99" as StandardBoardCoordinate;

      const result = canMoveInto(unit, standardBoard, invalidCoordinate);

      expect(result).toBe(false);
    });

    it("should return false when space has falsy unitPresence (defensive check)", () => {
      // Test coverage for lines 20-21: defensive check for falsy unitPresence
      // Using type assertion to create a board space with null unitPresence, which tests
      // the defensive check even though unitPresence is always defined in normal operation
      const unit = createUnitInstance("black");
      const board = createEmptyStandardBoard();
      // Use type assertion to bypass TypeScript's type checking and set unitPresence to null
      (board.board[coordinate] as any).unitPresence = null;

      const result = canMoveInto(unit, board, coordinate);

      expect(result).toBe(false);
    });

    it("should return false and log error for invalid unit presence type", () => {
      // Test coverage for lines 42-43: invalid unit presence type error handling
      // This tests the defensive check for unexpected unit presence types
      const unit = createUnitInstance("black");
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      // Create a board with an invalid unit presence type by directly modifying the board
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate],
        unitPresence: {
          presenceType: "invalid" as any, // Invalid presence type to test defensive check
        },
      };

      const result = canMoveInto(unit, board, coordinate);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Invalid unit presence type"
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
