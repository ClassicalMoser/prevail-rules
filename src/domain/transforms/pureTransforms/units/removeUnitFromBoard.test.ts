import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  placed,
} from '@testing';
import { createEmptyStandardBoard } from '@factories';

import { removeUnitFromBoard } from './removeUnitFromBoard';

/**
 * RemoveUnitFromBoard: removeUnitFromBoard.
 * A unit lifted from its space leaves it empty, or leaves the enemy it was
 * engaged with standing alone, facing the way it faced in the fight.
 */
describe('removeUnitFromBoard function', () => {
  // Black's unit, and the white enemy it may be engaged with.
  const unit = createTestUnit('black', { attack: 3 });
  const enemy = createTestUnit('white', { attack: 3 });
  // Another of Black's units, never on the space it is named at.
  const stranger = createTestUnit('black', { attack: 3, instanceNumber: 2 });

  describe('empty space', () => {
    it('throws when the space holds no unit', () => {
      const board = createEmptyStandardBoard();

      expect(() =>
        removeUnitFromBoard(board, placed(unit, 'E-5', 'north')),
      ).toThrow('Cannot remove unit from space with no unit');
    });
  });

  describe('single unit', () => {
    it('lifts a lone unit and leaves its space empty, every other space and the board it was given as they were', () => {
      // Black's unit on E-5; White's on D-4.
      const board = createBoardWithUnits([
        placed(unit, 'E-5', 'north'),
        placed(enemy, 'D-4', 'south'),
      ]);

      const newBoard = removeUnitFromBoard(board, placed(unit, 'E-5', 'north'));

      // E-5 is empty.
      expect(newBoard.board['E-5']?.unitPresence).toStrictEqual({
        presenceType: 'none',
      });
      // D-4 still holds White's unit, facing south.
      expect(newBoard.board['D-4']?.unitPresence).toStrictEqual({
        facing: 'south',
        presenceType: 'single',
        unit: enemy,
      });
      // The board it was given still has Black's unit on E-5.
      expect(board.board['E-5']?.unitPresence).toStrictEqual({
        facing: 'north',
        presenceType: 'single',
        unit,
      });
    });

    it('throws when the unit in the space is another one', () => {
      // Black's unit stands on E-5; the call names another black unit there.
      const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

      expect(() =>
        removeUnitFromBoard(board, placed(stranger, 'E-5', 'north')),
      ).toThrow('Unit mismatch');
    });
  });

  describe('engaged units - removing primary unit', () => {
    it('lifts the primary and leaves the secondary alone, facing opposite the primary', () => {
      // Black's unit on E-5 facing north, engaged with White's facing south.
      const board = createBoardWithEngagedUnits(unit, enemy, 'E-5', 'north');

      const newBoard = removeUnitFromBoard(board, placed(unit, 'E-5', 'north'));

      expect(newBoard.board['E-5']?.unitPresence).toStrictEqual({
        facing: 'south',
        presenceType: 'single',
        unit: enemy, // Opposite of primary facing
      });
      // The board it was given still has the two engaged.
      expect(board.board['E-5']?.unitPresence).toStrictEqual({
        presenceType: 'engaged',
        primaryFacing: 'north',
        primaryUnit: unit,
        secondaryUnit: enemy,
      });
    });
  });

  describe('engaged units - removing secondary unit', () => {
    it('lifts the secondary and leaves the primary alone, with the facing it held', () => {
      // Black's unit on E-5 facing north, engaged with White's facing south.
      const board = createBoardWithEngagedUnits(unit, enemy, 'E-5', 'north');

      const newBoard = removeUnitFromBoard(
        board,
        placed(enemy, 'E-5', 'south'),
      );

      expect(newBoard.board['E-5']?.unitPresence).toStrictEqual({
        facing: 'north',
        presenceType: 'single',
        unit, // Original primary facing
      });
    });
  });

  describe('engaged units - error cases', () => {
    it('throws when neither unit in the engaged space is the one named', () => {
      // Black's unit and White's engaged on E-5; another black unit is named.
      const board = createBoardWithEngagedUnits(unit, enemy, 'E-5', 'north');

      expect(() =>
        removeUnitFromBoard(board, placed(stranger, 'E-5', 'north')),
      ).toThrow('Unit mismatch');
    });
  });
});
