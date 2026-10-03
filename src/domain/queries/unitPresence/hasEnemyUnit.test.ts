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
describe(hasEnemyUnit, () => {
  const coordinate = 'E-5';

  describe('none unit presence', () => {
    it('given there is no unit, returns false', () => {
      const board = createEmptyStandardBoard();
      const space = boardSpaceAt(board, coordinate);
      const { result: blackResult } = hasEnemyUnit('black', space);
      expect(blackResult).toBe(false);
      const { result: whiteResult } = hasEnemyUnit('white', space);
      expect(whiteResult).toBe(false);
    });
  });

  describe('single unit presence', () => {
    it('given there is a friendly unit, returns false', () => {
      const board = createBoardWithSingleUnit(coordinate, 'black');
      const space = boardSpaceAt(board, coordinate);
      const { result } = hasEnemyUnit('black', space);
      expect(result).toBe(false);
    });

    it('given there is an enemy unit, returns true', () => {
      const board = createBoardWithSingleUnit(coordinate, 'white');
      const space = boardSpaceAt(board, coordinate);
      const { result } = hasEnemyUnit('black', space);
      expect(result).toBe(true);
    });

    it('given there is a black enemy unit, returns true for white player', () => {
      const board = createBoardWithSingleUnit(coordinate, 'black');
      const space = boardSpaceAt(board, coordinate);
      const { result } = hasEnemyUnit('white', space);
      expect(result).toBe(true);
    });
  });

  describe('engaged unit presence', () => {
    it('given units are engaged (always contains an enemy), returns true', () => {
      const blackUnit = createTestUnit('black', { attack: 3 });
      const whiteUnit = createTestUnit('white', { attack: 3 });
      const board = createBoardWithEngagedUnits(
        blackUnit,
        whiteUnit,
        coordinate,
      );
      const space = boardSpaceAt(board, coordinate);

      // Engaged units always contain an enemy for both sides
      const { result: blackResult } = hasEnemyUnit('black', space);
      expect(blackResult).toBe(true);
      const { result: whiteResult } = hasEnemyUnit('white', space);
      expect(whiteResult).toBe(true);
    });
  });

  describe('error handling', () => {
    it('given unitPresence has invalid type, returns false', () => {
      const board = createEmptyStandardBoard();
      const space = boardSpaceAt(board, coordinate);
      space.unitPresence = {
        presenceType: 'invalid',
      } as unknown as typeof space.unitPresence; // Intentionally bad type cast to test error path

      const { result } = hasEnemyUnit('black', space);
      expect(result).toBe(false);
    });

    it('given unitPresence is missing required properties, returns false', () => {
      const board = createEmptyStandardBoard();
      const space = boardSpaceAt(board, coordinate);
      space.unitPresence = {
        presenceType: 'single',
      } as unknown as typeof space.unitPresence; // Intentionally bad type cast to test error path

      const { result } = hasEnemyUnit('black', space);
      expect(result).toBe(false);
    });
  });
});
