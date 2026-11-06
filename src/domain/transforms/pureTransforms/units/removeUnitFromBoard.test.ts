import type { Coordinate } from '@entities';
import { createTestUnit, placed } from '@testing';
import { createEmptyStandardBoard } from '@factories';
import { throwIfUndefined } from '@utils';

import { removeUnitFromBoard } from './removeUnitFromBoard';

/**
 * RemoveUnitFromBoard: removeUnitFromBoard.
 */
describe('removeUnitFromBoard function', () => {
  const coordinate: Coordinate = 'E-5';

  describe('empty space', () => {
    it('given error when trying to remove unit from empty space, throws', () => {
      const board = createEmptyStandardBoard();
      const unit = createTestUnit('black', { attack: 3 });
      const unitWithPlacement = placed(unit, coordinate, 'north');

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
        ...throwIfUndefined(
          board.board[coordinate],
          `expected board space at ${coordinate}`,
        ),
        unitPresence: {
          facing: 'north',
          presenceType: 'single',
          unit,
        },
      };
      const unitWithPlacement = placed(unit, coordinate, 'north');

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
        ...throwIfUndefined(
          board.board[coordinate],
          `expected board space at ${coordinate}`,
        ),
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
      const unitWithPlacement = placed(differentUnit, coordinate, 'north');

      expect(() => removeUnitFromBoard(board, unitWithPlacement)).toThrow(
        'Unit mismatch',
      );
    });

    it('given not mutate the original board', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createEmptyStandardBoard();
      board.board[coordinate] = {
        ...throwIfUndefined(
          board.board[coordinate],
          `expected board space at ${coordinate}`,
        ),
        unitPresence: {
          facing: 'north',
          presenceType: 'single',
          unit,
        },
      };
      const unitWithPlacement = placed(unit, coordinate, 'north');

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
        ...throwIfUndefined(
          board.board[coordinate],
          `expected board space at ${coordinate}`,
        ),
        unitPresence: {
          facing: 'north',
          presenceType: 'single',
          unit,
        },
      };

      const otherCoord: Coordinate = 'D-4';
      const otherUnit = createTestUnit('white', { attack: 3 });
      board.board[otherCoord] = {
        ...throwIfUndefined(
          board.board[otherCoord],
          `expected board space at ${otherCoord}`,
        ),
        unitPresence: {
          facing: 'south',
          presenceType: 'single',
          unit: otherUnit,
        },
      };

      const unitWithPlacement = placed(unit, coordinate, 'north');

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
        ...throwIfUndefined(
          board.board[coordinate],
          `expected board space at ${coordinate}`,
        ),
        unitPresence: {
          presenceType: 'engaged',
          primaryFacing: 'north',
          primaryUnit,
          secondaryUnit,
        },
      };
      const unitWithPlacement = placed(primaryUnit, coordinate, 'north');

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
        ...throwIfUndefined(
          board.board[coordinate],
          `expected board space at ${coordinate}`,
        ),
        unitPresence: {
          presenceType: 'engaged',
          primaryFacing: 'east',
          primaryUnit,
          secondaryUnit,
        },
      };
      const unitWithPlacement = placed(primaryUnit, coordinate, 'east');

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
        ...throwIfUndefined(
          board.board[coordinate],
          `expected board space at ${coordinate}`,
        ),
        unitPresence: {
          presenceType: 'engaged',
          primaryFacing: 'north',
          primaryUnit,
          secondaryUnit,
        },
      };
      const unitWithPlacement = placed(primaryUnit, coordinate, 'north');

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
        ...throwIfUndefined(
          board.board[coordinate],
          `expected board space at ${coordinate}`,
        ),
        unitPresence: {
          presenceType: 'engaged',
          primaryFacing: 'north',
          primaryUnit,
          secondaryUnit,
        },
      };
      const unitWithPlacement = placed(secondaryUnit, coordinate, 'south');

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
        ...throwIfUndefined(
          board.board[coordinate],
          `expected board space at ${coordinate}`,
        ),
        unitPresence: {
          presenceType: 'engaged',
          primaryFacing: 'north',
          primaryUnit,
          secondaryUnit,
        },
      };
      const unitWithPlacement = placed(secondaryUnit, coordinate, 'south');

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
        ...throwIfUndefined(
          board.board[coordinate],
          `expected board space at ${coordinate}`,
        ),
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
      const unitWithPlacement = placed(differentUnit, coordinate, 'north');

      expect(() => removeUnitFromBoard(board, unitWithPlacement)).toThrow(
        'Unit mismatch',
      );
    });

    it('given error for invalid unit presence type, throws', () => {
      const board = createEmptyStandardBoard();
      const boardSpace = throwIfUndefined(
        board.board[coordinate],
        `expected board space at ${coordinate}`,
      );
      boardSpace.unitPresence = {
        facing: 'north',
        presenceType: 'invalid',
        unit: createTestUnit('black', { attack: 3 }),
      } as unknown as typeof boardSpace.unitPresence; // Intentionally bad type cast to test error path

      const unit = createTestUnit('black', { attack: 3 });
      const unitWithPlacement = placed(unit, coordinate, 'north');

      expect(() => removeUnitFromBoard(board, unitWithPlacement)).toThrow(
        'Invalid unit presence',
      );
    });
  });
});
