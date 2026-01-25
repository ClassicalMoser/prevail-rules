import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import { createTestUnit } from '@testing';
import { createEmptyStandardBoard } from '@transforms/initializations';
import { describe, expect, it } from 'vitest';
import { addUnitToBoard } from './addUnitToBoard';

describe('addUnitToBoard', () => {
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
    it('should add a single unit to an empty space', () => {
      const board = createEmptyStandardBoard();
      const unit = createTestUnit('black', { attack: 3 });
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      const newBoard = addUnitToBoard(board, unitWithPlacement);

      expect(newBoard).not.toBe(board);
      expect(newBoard.board[coordinate]?.unitPresence).toEqual({
        presenceType: 'single',
        unit,
        facing: 'north',
      });
    });

    it('should not mutate the original board', () => {
      const board = createEmptyStandardBoard();
      const unit = createTestUnit('black', { attack: 3 });
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      addUnitToBoard(board, unitWithPlacement);

      expect(board.board[coordinate]?.unitPresence).toEqual({
        presenceType: 'none',
      });
    });

    it('should preserve other board spaces', () => {
      const board = createEmptyStandardBoard();
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

      const unit = createTestUnit('black', { attack: 3 });
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      const newBoard = addUnitToBoard(board, unitWithPlacement);

      expect(newBoard.board[otherCoord]?.unitPresence).toEqual({
        presenceType: 'single',
        unit: otherUnit,
        facing: 'south',
      });
    });
  });

  describe('space with engaged units', () => {
    it('should throw error when trying to add unit to space with engaged units', () => {
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

      const newUnit = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const unitWithPlacement = createUnitWithPlacement(
        newUnit,
        coordinate,
        'south',
      );

      expect(() => addUnitToBoard(board, unitWithPlacement)).toThrow(
        'Cannot add unit to space with engaged units',
      );
    });
  });

  describe('space with friendly single unit', () => {
    it('should throw error when trying to add friendly unit to space with friendly unit', () => {
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

      const newUnit = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const unitWithPlacement = createUnitWithPlacement(
        newUnit,
        coordinate,
        'south',
      );

      expect(() => addUnitToBoard(board, unitWithPlacement)).toThrow(
        'Cannot add unit to space with friendly unit',
      );
    });
  });

  describe('space with enemy single unit', () => {
    it('should create engaged unit presence when adding enemy unit with opposite facing', () => {
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

      const newUnit = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      const unitWithPlacement = createUnitWithPlacement(
        newUnit,
        coordinate,
        'south',
      );

      const newBoard = addUnitToBoard(board, unitWithPlacement);

      expect(newBoard.board[coordinate]?.unitPresence).toEqual({
        presenceType: 'engaged',
        primaryUnit: existingUnit,
        primaryFacing: 'north',
        secondaryUnit: newUnit,
      });
    });

    it('should throw error when adding enemy unit without opposite facing', () => {
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

      const newUnit = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      const unitWithPlacement = createUnitWithPlacement(
        newUnit,
        coordinate,
        'north',
      );

      expect(() => addUnitToBoard(board, unitWithPlacement)).toThrow(
        'Engaged unit must have opposite facing',
      );
    });

    it('should not mutate the original board when creating engagement', () => {
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

      const newUnit = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      const unitWithPlacement = createUnitWithPlacement(
        newUnit,
        coordinate,
        'south',
      );

      addUnitToBoard(board, unitWithPlacement);

      expect(board.board[coordinate]?.unitPresence).toEqual({
        presenceType: 'single',
        unit: existingUnit,
        facing: 'north',
      });
    });
  });
});
