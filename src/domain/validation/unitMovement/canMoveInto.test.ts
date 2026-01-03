import type {
  PlayerSide,
  StandardBoard,
  StandardBoardCoordinate,
  UnitInstance,
} from '@entities';
import {
  createBoardWithEngagedUnits,
  createBoardWithSingleUnit,
  createTestUnit,
} from '@testing';
import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { canMoveInto } from './canMoveInto';

describe('canMoveInto', () => {
  const standardBoard: StandardBoard = createEmptyStandardBoard();
  const coordinate: StandardBoardCoordinate = 'E-5';

  // Helper function to create a unit instance with a specific player side.
  const createUnitInstance = (playerSide: PlayerSide): UnitInstance => {
    return createTestUnit(playerSide, { attack: 3 });
  };

  describe('invalid inputs', () => {
    it('should return false for a non-existent coordinate', () => {
      const unit = createUnitInstance('black');
      const invalidCoordinate = 'Z-99' as StandardBoardCoordinate;
      expect(canMoveInto(unit, standardBoard, invalidCoordinate)).toBe(false);
    });
  });

  describe('empty space', () => {
    it('should return true for an empty space', () => {
      const unit = createUnitInstance('black');
      expect(canMoveInto(unit, standardBoard, coordinate)).toBe(true);
    });
  });

  describe('engaged space', () => {
    it('should return false for a space with two engaged units', () => {
      const unit = createUnitInstance('black');
      const primaryUnit = createUnitInstance('black');
      const secondaryUnit = createUnitInstance('white');
      const board = createBoardWithEngagedUnits(primaryUnit, secondaryUnit);
      expect(canMoveInto(unit, board, coordinate)).toBe(false);
    });
  });

  describe('single friendly unit', () => {
    it('should return false for a space with a single friendly unit', () => {
      const unit = createUnitInstance('black');
      const board = createBoardWithSingleUnit(coordinate, 'black');
      expect(canMoveInto(unit, board, coordinate)).toBe(false);
    });

    it('should return false for white player with a single friendly unit', () => {
      const unit = createUnitInstance('white');
      const board = createBoardWithSingleUnit(coordinate, 'white');
      expect(canMoveInto(unit, board, coordinate)).toBe(false);
    });
  });

  describe('single enemy unit', () => {
    it('should return true for a space with a single enemy unit', () => {
      const unit = createUnitInstance('black');
      const board = createBoardWithSingleUnit(coordinate, 'white');
      expect(canMoveInto(unit, board, coordinate)).toBe(true);
    });

    it('should return true for white player with a single enemy unit', () => {
      const unit = createUnitInstance('white');
      const board = createBoardWithSingleUnit(coordinate, 'black');
      expect(canMoveInto(unit, board, coordinate)).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should return false when coordinate is invalid (defensive check)', () => {
      // Test coverage for lines 15-16: defensive check for undefined space
      // Using invalid coordinate causes getBoardSpace to throw, which is caught and returns false
      const unit = createUnitInstance('black');
      const invalidCoordinate = 'Z-99' as StandardBoardCoordinate;

      const result = canMoveInto(unit, standardBoard, invalidCoordinate);

      expect(result).toBe(false);
    });

    it('should return false when unitPresence has invalid type', () => {
      // Test coverage for else block: handles unexpected unitPresence state
      // Using type assertion to create a board space with invalid unitPresence type,
      // which tests the else block even though this should never happen in normal operation
      const unit = createUnitInstance('black');
      const board = createEmptyStandardBoard();
      // Use type assertion to bypass TypeScript's type checking and set unitPresence to an invalid value
      // This causes all type guards to fail and fall through to the else block
      (board.board[coordinate] as any).unitPresence = {
        presenceType: 'invalid' as any,
      };

      const result = canMoveInto(unit, board, coordinate);

      expect(result).toBe(false);
    });
  });
});
