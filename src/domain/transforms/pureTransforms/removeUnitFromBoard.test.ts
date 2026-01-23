import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import { createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { createEmptyStandardBoard } from './createEmptyBoard';
import { removeUnitFromBoard } from './removeUnitFromBoard';

describe('removeUnitFromBoard', () => {
  const coordinate: StandardBoardCoordinate = 'E-5';

  // Helper function to create a UnitWithPlacement
  const createUnitWithPlacement = (
    unit: UnitInstance,
    coord: StandardBoardCoordinate,
    facing: UnitFacing,
  ): UnitWithPlacement<StandardBoard> => {
    return {
      unit,
      placement: {
        coordinate: coord,
        facing,
      },
    };
  };

  describe('empty space', () => {
    it('should throw error when trying to remove unit from empty space', () => {
      const board = createEmptyStandardBoard();
      const unit = createTestUnit('black', { attack: 3 });
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      expect(() => removeUnitFromBoard(board, unitWithPlacement)).toThrow(
        'Cannot remove unit from space with no unit',
      );
    });
  });

  describe('single unit', () => {
    it('should remove a single unit and leave empty space', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          presenceType: 'single',
          unit,
          facing: 'north',
        },
      };
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      const newBoard = removeUnitFromBoard(board, unitWithPlacement);

      expect(newBoard).not.toBe(board);
      expect(newBoard.board[coordinate]?.unitPresence).toEqual({
        presenceType: 'none',
      });
    });

    it('should throw error when unit does not match', () => {
      const existingUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          presenceType: 'single',
          unit: existingUnit,
          facing: 'north',
        },
      };

      const differentUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      const unitWithPlacement = createUnitWithPlacement(
        differentUnit,
        coordinate,
        'north',
      );

      expect(() => removeUnitFromBoard(board, unitWithPlacement)).toThrow(
        'Unit mismatch',
      );
    });

    it('should not mutate the original board', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          presenceType: 'single',
          unit,
          facing: 'north',
        },
      };
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      removeUnitFromBoard(board, unitWithPlacement);

      expect(board.board[coordinate]?.unitPresence).toEqual({
        presenceType: 'single',
        unit,
        facing: 'north',
      });
    });

    it('should preserve other board spaces', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          presenceType: 'single',
          unit,
          facing: 'north',
        },
      };

      const otherCoord: StandardBoardCoordinate = 'D-4';
      const otherUnit = createTestUnit('white', { attack: 3 });
      board.board[otherCoord] = {
        ...board.board[otherCoord]!,
        unitPresence: {
          presenceType: 'single',
          unit: otherUnit,
          facing: 'south',
        },
      };

      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      const newBoard = removeUnitFromBoard(board, unitWithPlacement);

      expect(newBoard.board[otherCoord]?.unitPresence).toEqual({
        presenceType: 'single',
        unit: otherUnit,
        facing: 'south',
      });
    });
  });

  describe('engaged units - removing primary unit', () => {
    it('should remove primary unit and leave secondary unit with opposite facing', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const secondaryUnit = createTestUnit('white', {
        attack: 3,
        instanceNumber: 1,
      });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          presenceType: 'engaged',
          primaryUnit,
          primaryFacing: 'north',
          secondaryUnit,
        },
      };
      const unitWithPlacement = createUnitWithPlacement(
        primaryUnit,
        coordinate,
        'north',
      );

      const newBoard = removeUnitFromBoard(board, unitWithPlacement);

      expect(newBoard).not.toBe(board);
      expect(newBoard.board[coordinate]?.unitPresence).toEqual({
        presenceType: 'single',
        unit: secondaryUnit,
        facing: 'south', // Opposite of primary facing
      });
    });

    it('should handle different primary facings correctly', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const secondaryUnit = createTestUnit('white', {
        attack: 3,
        instanceNumber: 1,
      });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          presenceType: 'engaged',
          primaryUnit,
          primaryFacing: 'east',
          secondaryUnit,
        },
      };
      const unitWithPlacement = createUnitWithPlacement(
        primaryUnit,
        coordinate,
        'east',
      );

      const newBoard = removeUnitFromBoard(board, unitWithPlacement);

      expect(newBoard.board[coordinate]?.unitPresence).toEqual({
        presenceType: 'single',
        unit: secondaryUnit,
        facing: 'west', // Opposite of east
      });
    });

    it('should not mutate the original board when removing primary unit', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const secondaryUnit = createTestUnit('white', {
        attack: 3,
        instanceNumber: 1,
      });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          presenceType: 'engaged',
          primaryUnit,
          primaryFacing: 'north',
          secondaryUnit,
        },
      };
      const unitWithPlacement = createUnitWithPlacement(
        primaryUnit,
        coordinate,
        'north',
      );

      removeUnitFromBoard(board, unitWithPlacement);

      expect(board.board[coordinate]?.unitPresence).toEqual({
        presenceType: 'engaged',
        primaryUnit,
        primaryFacing: 'north',
        secondaryUnit,
      });
    });
  });

  describe('engaged units - removing secondary unit', () => {
    it('should remove secondary unit and leave primary unit with original facing', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const secondaryUnit = createTestUnit('white', {
        attack: 3,
        instanceNumber: 1,
      });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          presenceType: 'engaged',
          primaryUnit,
          primaryFacing: 'north',
          secondaryUnit,
        },
      };
      const unitWithPlacement = createUnitWithPlacement(
        secondaryUnit,
        coordinate,
        'south',
      );

      const newBoard = removeUnitFromBoard(board, unitWithPlacement);

      expect(newBoard).not.toBe(board);
      expect(newBoard.board[coordinate]?.unitPresence).toEqual({
        presenceType: 'single',
        unit: primaryUnit,
        facing: 'north', // Original primary facing
      });
    });

    it('should not mutate the original board when removing secondary unit', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const secondaryUnit = createTestUnit('white', {
        attack: 3,
        instanceNumber: 1,
      });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          presenceType: 'engaged',
          primaryUnit,
          primaryFacing: 'north',
          secondaryUnit,
        },
      };
      const unitWithPlacement = createUnitWithPlacement(
        secondaryUnit,
        coordinate,
        'south',
      );

      removeUnitFromBoard(board, unitWithPlacement);

      expect(board.board[coordinate]?.unitPresence).toEqual({
        presenceType: 'engaged',
        primaryUnit,
        primaryFacing: 'north',
        secondaryUnit,
      });
    });
  });

  describe('engaged units - error cases', () => {
    it('should throw error when unit does not match either engaged unit', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const secondaryUnit = createTestUnit('white', {
        attack: 3,
        instanceNumber: 1,
      });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          presenceType: 'engaged',
          primaryUnit,
          primaryFacing: 'north',
          secondaryUnit,
        },
      };

      const differentUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      const unitWithPlacement = createUnitWithPlacement(
        differentUnit,
        coordinate,
        'north',
      );

      expect(() => removeUnitFromBoard(board, unitWithPlacement)).toThrow(
        'Unit mismatch',
      );
    });

    it('should throw error for invalid unit presence type', () => {
      const board = createEmptyStandardBoard();
      // Create an invalid unit presence that passes the 'none' and 'single' checks
      // but fails the 'engaged' check - this is a TypeScript exhaustiveness guard
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          presenceType: 'single',
          unit: createTestUnit('black', { attack: 3 }),
          facing: 'north',
        } as any,
      };
      // Override to invalid type after creation
      (board.board[coordinate]!.unitPresence as any).presenceType = 'invalid';

      const unit = createTestUnit('black', { attack: 3 });
      const unitWithPlacement = createUnitWithPlacement(unit, coordinate, 'north');

      expect(() => removeUnitFromBoard(board, unitWithPlacement)).toThrow(
        'Invalid unit presence',
      );
    });
  });
});
