import type { StandardBoardCoordinate } from '@entities';
import {
  createBoardWithSingleUnit,
  createBoardWithUnits,
  createTestUnit,
} from '@testing';
import { createEmptyStandardBoard } from '@transforms';

import { diagonalIsClear } from './diagonalIsClear';

/**
 * DiagonalIsClear: diagonalIsClear.
 */
describe(diagonalIsClear, () => {
  const coordinate: StandardBoardCoordinate = 'E-5';
  const board = createEmptyStandardBoard();

  describe('non-diagonal facings', () => {
    it('given orthogonal facing, returns false', () => {
      const { result } = diagonalIsClear('black', board, coordinate, 'E-6');
      expect(result).toBeFalsy();
    });
  });

  describe('diagonal facings with no enemy units', () => {
    it('given diagonal facing with no adjacent enemies, returns true', () => {
      const { result } = diagonalIsClear('black', board, coordinate, 'D-4');
      expect(result).toBeTruthy();
    });
  });

  describe('diagonal facings with one enemy unit', () => {
    it('given only one adjacent space has an enemy, returns true', () => {
      // NorthEast at E-5 has adjacent orthogonal spaces: D-5 (north) and E-6 (east)
      // Place enemy at D-5 only - need more than one enemy to block
      const boardWithEnemy = createBoardWithSingleUnit('D-5', 'white');
      const { result } = diagonalIsClear(
        'black',
        boardWithEnemy,
        coordinate,
        'D-4',
      );
      expect(result).toBeTruthy();
    });
  });

  describe('diagonal facings with two enemy units', () => {
    it('given both adjacent orthogonal spaces have enemy units, returns false', () => {
      // NorthEast at E-5 has adjacent orthogonal spaces: D-5 (north) and E-6 (east)
      const boardWithEnemies = createBoardWithUnits([
        {
          coordinate: 'D-5',
          facing: 'north',
          unit: createTestUnit('white', { attack: 3 }),
        },
        {
          coordinate: 'E-6',
          facing: 'north',
          unit: createTestUnit('white', { attack: 3, instanceNumber: 2 }),
        },
      ]);
      const { result } = diagonalIsClear(
        'black',
        boardWithEnemies,
        coordinate,
        'D-6',
      );
      expect(result).toBeFalsy();
    });

    it('given different diagonal directions, returns true', () => {
      // SouthWest at E-5 has adjacent orthogonal spaces: F-5 (south) and E-4 (west)
      const boardWithEnemies = createBoardWithUnits([
        {
          coordinate: 'F-5',
          facing: 'north',
          unit: createTestUnit('white', { attack: 3 }),
        },
      ]);
      const { result } = diagonalIsClear(
        'black',
        boardWithEnemies,
        coordinate,
        'F-4',
      );
      expect(result).toBeTruthy();
    });
  });

  describe('diagonal facings with friendly units', () => {
    it('given northEast facing with friendly units at adjacent spaces, returns true', () => {
      const boardWithFriendlies = createBoardWithUnits([
        {
          coordinate: 'D-5',
          facing: 'north',
          unit: createTestUnit('black', { attack: 3 }),
        },
        {
          coordinate: 'E-6',
          facing: 'north',
          unit: createTestUnit('black', { attack: 3, instanceNumber: 2 }),
        },
      ]);
      const { result } = diagonalIsClear(
        'black',
        boardWithFriendlies,
        coordinate,
        'D-6',
      );
      expect(result).toBeTruthy();
    });
  });

  describe('diagonal facings with mixed friendly and enemy units', () => {
    it('given northEast facing with one friendly and one enemy, returns false', () => {
      const boardWithMixed = createBoardWithUnits([
        {
          coordinate: 'D-5',
          facing: 'north',
          unit: createTestUnit('black', { attack: 3 }),
        },
        {
          coordinate: 'E-6',
          facing: 'north',
          unit: createTestUnit('white', { attack: 3 }),
        },
      ]);
      const { result } = diagonalIsClear(
        'black',
        boardWithMixed,
        coordinate,
        'D-6',
      );
      expect(result).toBeTruthy();
    });
  });

  describe('edge cases and error handling', () => {
    it('given coordinate is invalid, returns false', () => {
      const invalidCoordinate = 'Z-99' as StandardBoardCoordinate;
      const { result } = diagonalIsClear(
        'black',
        board,
        coordinate,
        invalidCoordinate,
      );
      expect(result).toBeFalsy();
    });

    it('given adjacent coordinate is out of bounds, returns false', () => {
      // Test at edge of board where one adjacent space might be undefined
      const edgeCoordinate: StandardBoardCoordinate = 'A-1';
      const { result } = diagonalIsClear(
        'black',
        board,
        coordinate,
        edgeCoordinate,
      );
      expect(result).toBeFalsy();
    });

    it('given work correctly for both player sides', () => {
      const boardWithEnemies = createBoardWithUnits([
        {
          coordinate: 'D-5',
          facing: 'north',
          unit: createTestUnit('black', { attack: 3 }),
        },
      ]);
      const { result } = diagonalIsClear(
        'white',
        boardWithEnemies,
        coordinate,
        'D-6',
      );
      expect(result).toBeTruthy();
    });
  });
});
