import type { BoardSpace } from '@entities';
import {
  createBoardWithEngagedUnits,
  createBoardWithSingleUnit,
  createTestUnit,
} from '@testing';
import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { hasEnemyUnit } from './hasEnemyUnit';

describe('hasEnemyUnit', () => {
  const coordinate = 'E-5';

  describe('none unit presence', () => {
    it('should return false when there is no unit', () => {
      const board = createEmptyStandardBoard();
      const space: BoardSpace = board.board[coordinate];
      expect(hasEnemyUnit('black', space)).toBe(false);
      expect(hasEnemyUnit('white', space)).toBe(false);
    });
  });

  describe('single unit presence', () => {
    it('should return false when there is a friendly unit', () => {
      const board = createBoardWithSingleUnit(coordinate, 'black');
      const space: BoardSpace = board.board[coordinate];
      expect(hasEnemyUnit('black', space)).toBe(false);
    });

    it('should return true when there is an enemy unit', () => {
      const board = createBoardWithSingleUnit(coordinate, 'white');
      const space: BoardSpace = board.board[coordinate];
      expect(hasEnemyUnit('black', space)).toBe(true);
    });

    it('should return true for white player when there is a black enemy unit', () => {
      const board = createBoardWithSingleUnit(coordinate, 'black');
      const space: BoardSpace = board.board[coordinate];
      expect(hasEnemyUnit('white', space)).toBe(true);
    });
  });

  describe('engaged unit presence', () => {
    it('should return true when units are engaged (always contains an enemy)', () => {
      const blackUnit = createTestUnit('black', { attack: 3 });
      const whiteUnit = createTestUnit('white', { attack: 3 });
      const board = createBoardWithEngagedUnits(
        blackUnit,
        whiteUnit,
        coordinate,
      );
      const space: BoardSpace = board.board[coordinate];

      // Engaged units always contain an enemy for both sides
      expect(hasEnemyUnit('black', space)).toBe(true);
      expect(hasEnemyUnit('white', space)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should return false when unitPresence has invalid type', () => {
      const board = createEmptyStandardBoard();
      const space: BoardSpace = board.board[coordinate];
      // Use type assertion to bypass TypeScript's type checking and set unitPresence to an invalid value
      // This tests the catch block - validation functions never throw
      (space as any).unitPresence = {
        presenceType: 'invalid' as any,
      };

      expect(hasEnemyUnit('black', space)).toBe(false);
    });

    it('should return false when unitPresence is missing required properties', () => {
      const board = createEmptyStandardBoard();
      const space: BoardSpace = board.board[coordinate];
      // Create a malformed unitPresence that might cause errors when accessing properties
      (space as any).unitPresence = {
        presenceType: 'single',
        // Missing 'unit' property - would cause error when accessing unit.playerSide
      };

      expect(hasEnemyUnit('black', space)).toBe(false);
    });
  });
});
