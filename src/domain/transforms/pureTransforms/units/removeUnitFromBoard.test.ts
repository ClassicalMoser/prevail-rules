import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import { createTestUnit } from '@testing';
import { createEmptyStandardBoard } from '@transforms/initializations';

import { removeUnitFromBoard } from './removeUnitFromBoard';

/**
 * RemoveUnitFromBoard: removeUnitFromBoard.
 */
describe(removeUnitFromBoard, () => {
  const coordinate: StandardBoardCoordinate = 'E-5';

  // Helper function to create a UnitWithPlacement
  const createUnitWithPlacement = (
    unit: UnitInstance,
    coord: StandardBoardCoordinate,
    facing: UnitFacing,
  ): UnitWithPlacement<StandardBoard> => ({
    boardType: 'standard' as const,
    placement: { boardType: 'standard' as const, coordinate: coord, facing },
    unit,
  });

  describe('empty space', () => {
    it('given error when trying to remove unit from empty space, throws', () => {
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
    it('given remove a single unit and leave empty space', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          facing: 'north',
          presenceType: 'single',
          unit,
        },
      };
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      const newBoard = removeUnitFromBoard(board, unitWithPlacement);

      expect(newBoard).not.toBe(board);
      expect(newBoard.board[coordinate]?.unitPresence).toStrictEqual({
        presenceType: 'none',
      });
    });

    it('given error when unit does not match, throws', () => {
      const existingUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          facing: 'north',
          presenceType: 'single',
          unit: existingUnit,
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

    it('given not mutate the original board', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          facing: 'north',
          presenceType: 'single',
          unit,
        },
      };
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      removeUnitFromBoard(board, unitWithPlacement);

      expect(board.board[coordinate]?.unitPresence).toStrictEqual({
        facing: 'north',
        presenceType: 'single',
        unit,
      });
    });

    it('given preserve other board spaces', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          facing: 'north',
          presenceType: 'single',
          unit,
        },
      };

      const otherCoord: StandardBoardCoordinate = 'D-4';
      const otherUnit = createTestUnit('white', { attack: 3 });
      board.board[otherCoord] = {
        ...board.board[otherCoord]!,
        unitPresence: {
          facing: 'south',
          presenceType: 'single',
          unit: otherUnit,
        },
      };

      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      const newBoard = removeUnitFromBoard(board, unitWithPlacement);

      expect(newBoard.board[otherCoord]?.unitPresence).toStrictEqual({
        facing: 'south',
        presenceType: 'single',
        unit: otherUnit,
      });
    });
  });

  describe('engaged units - removing primary unit', () => {
    it('given remove primary unit and leave secondary unit with opposite facing', () => {
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
          primaryFacing: 'north',
          primaryUnit,
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
      expect(newBoard.board[coordinate]?.unitPresence).toStrictEqual({
        facing: 'south',
        presenceType: 'single',
        unit: secondaryUnit, // Opposite of primary facing
      });
    });

    it('given handle different primary facings correctly', () => {
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
          primaryFacing: 'east',
          primaryUnit,
          secondaryUnit,
        },
      };
      const unitWithPlacement = createUnitWithPlacement(
        primaryUnit,
        coordinate,
        'east',
      );

      const newBoard = removeUnitFromBoard(board, unitWithPlacement);

      expect(newBoard.board[coordinate]?.unitPresence).toStrictEqual({
        facing: 'west',
        presenceType: 'single',
        unit: secondaryUnit, // Opposite of east
      });
    });

    it('given removing primary unit, does not mutate the original board', () => {
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
          primaryFacing: 'north',
          primaryUnit,
          secondaryUnit,
        },
      };
      const unitWithPlacement = createUnitWithPlacement(
        primaryUnit,
        coordinate,
        'north',
      );

      removeUnitFromBoard(board, unitWithPlacement);

      expect(board.board[coordinate]?.unitPresence).toStrictEqual({
        presenceType: 'engaged',
        primaryFacing: 'north',
        primaryUnit,
        secondaryUnit,
      });
    });
  });

  describe('engaged units - removing secondary unit', () => {
    it('given remove secondary unit and leave primary unit with original facing', () => {
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
          primaryFacing: 'north',
          primaryUnit,
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
      expect(newBoard.board[coordinate]?.unitPresence).toStrictEqual({
        facing: 'north',
        presenceType: 'single',
        unit: primaryUnit, // Original primary facing
      });
    });

    it('given removing secondary unit, does not mutate the original board', () => {
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
          primaryFacing: 'north',
          primaryUnit,
          secondaryUnit,
        },
      };
      const unitWithPlacement = createUnitWithPlacement(
        secondaryUnit,
        coordinate,
        'south',
      );

      removeUnitFromBoard(board, unitWithPlacement);

      expect(board.board[coordinate]?.unitPresence).toStrictEqual({
        presenceType: 'engaged',
        primaryFacing: 'north',
        primaryUnit,
        secondaryUnit,
      });
    });
  });

  describe('engaged units - error cases', () => {
    it('given error when unit does not match either engaged unit, throws', () => {
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
          primaryFacing: 'north',
          primaryUnit,
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

    it('given error for invalid unit presence type, throws', () => {
      const board = createEmptyStandardBoard();
      // Create an invalid unit presence that passes the 'none' and 'single' checks
      // But fails the 'engaged' check - this is a TypeScript exhaustiveness guard
      board.board[coordinate] = {
        ...board.board[coordinate]!,
        unitPresence: {
          facing: 'north',
          presenceType: 'single',
          unit: createTestUnit('black', { attack: 3 }),
        } as any,
      };
      // Override to invalid type after creation
      (board.board[coordinate]!.unitPresence as any).presenceType = 'invalid';

      const unit = createTestUnit('black', { attack: 3 });
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      expect(() => removeUnitFromBoard(board, unitWithPlacement)).toThrow(
        'Invalid unit presence',
      );
    });
  });
});
