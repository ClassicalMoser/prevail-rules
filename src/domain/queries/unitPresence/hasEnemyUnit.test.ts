import type { Board, BoardSpace, Coordinate } from '@entities';
import {
  createBoardWithEngagedUnits,
  createBoardWithSingleUnit,
  createTestUnit,
} from '@testing';
import { createEmptyStandardBoard } from '@factories';
import { throwIfUndefined } from '@utils';

import { hasEnemyUnit } from './hasEnemyUnit';

function boardSpaceAt(board: Board, coord: Coordinate): BoardSpace {
  const space = throwIfUndefined(
    board.board[coord],
    `expected board space at ${coord}`,
  );
  return space;
}

/**
 * HasEnemyUnit: Checks if an enemy unit is found in the space.
 */
describe('hasEnemyUnit function', () => {
  const coordinate = 'E-5';

  describe('none unit presence', () => {
    it('returns false when there is no unit', () => {
      const board = createEmptyStandardBoard();
      const space = boardSpaceAt(board, coordinate);
      const blackResult = hasEnemyUnit('black', space);
      expect(blackResult).toBe(false);
      const whiteResult = hasEnemyUnit('white', space);
      expect(whiteResult).toBe(false);
    });
  });

  describe('single unit presence', () => {
    it('returns false when there is a friendly unit', () => {
      const board = createBoardWithSingleUnit(coordinate, 'black');
      const space = boardSpaceAt(board, coordinate);
      expect(hasEnemyUnit('black', space)).toBe(false);
    });

    it('returns true when there is an enemy unit', () => {
      const board = createBoardWithSingleUnit(coordinate, 'white');
      const space = boardSpaceAt(board, coordinate);
      expect(hasEnemyUnit('black', space)).toBe(true);
    });

    it('returns true for white player when there is a black enemy unit', () => {
      const board = createBoardWithSingleUnit(coordinate, 'black');
      const space = boardSpaceAt(board, coordinate);
      expect(hasEnemyUnit('white', space)).toBe(true);
    });
  });

  describe('engaged unit presence', () => {
    it('returns true when units are engaged (always contains an enemy)', () => {
      const blackUnit = createTestUnit('black', { attack: 3 });
      const whiteUnit = createTestUnit('white', { attack: 3 });
      const board = createBoardWithEngagedUnits(
        blackUnit,
        whiteUnit,
        coordinate,
      );
      const space = boardSpaceAt(board, coordinate);

      // Engaged units always contain an enemy for both sides
      const blackResult = hasEnemyUnit('black', space);
      expect(blackResult).toBe(true);
      const whiteResult = hasEnemyUnit('white', space);
      expect(whiteResult).toBe(true);
    });
  });

  describe('error handling', () => {
    it('returns false when unitPresence has invalid type', () => {
      const board = createEmptyStandardBoard();
      const space = boardSpaceAt(board, coordinate);
      space.unitPresence = {
        presenceType: 'invalid',
      } as unknown as typeof space.unitPresence; // Intentionally bad type cast to test error path

      expect(hasEnemyUnit('black', space)).toBe(false);
    });
  });
});
