import type { Coordinate } from '@entities';
import {
  createBoardWithSingleUnit,
  createBoardWithUnits,
  createTestUnit,
  placed,
} from '@testing';
import { createEmptyStandardBoard } from '@factories';

import { diagonalIsClear } from './diagonalIsClear';

describe('diagonalIsClear function', () => {
  const coordinate: Coordinate = 'E-5';
  const board = createEmptyStandardBoard();

  it('an orthogonal neighbor is rejected', () => {
    expect(() => diagonalIsClear('black', board, coordinate, 'E-6')).toThrow(
      'Target space E-6 is not diagonally adjacent to E-5',
    );
  });

  it('a non-adjacent target is rejected', () => {
    // Test at edge of board where one adjacent space might be undefined
    expect(() => diagonalIsClear('black', board, coordinate, 'A-1')).toThrow(
      'Target space A-1 is not diagonally adjacent to E-5',
    );
  });

  it('is clear when no enemy stands between the spaces', () => {
    expect(diagonalIsClear('black', board, coordinate, 'D-4')).toBe(true);
  });

  it('stays clear when only one intervening space holds an enemy', () => {
    // NorthEast at E-5 has adjacent orthogonal spaces: D-5 (north) and E-6 (east)
    // Place enemy at D-5 only - need more than one enemy to block
    const boardWithEnemy = createBoardWithSingleUnit('D-5', 'white');
    expect(diagonalIsClear('black', boardWithEnemy, coordinate, 'D-4')).toBe(
      true,
    );
  });

  it('is blocked when enemies occupy both intervening spaces', () => {
    // NorthEast at E-5 has adjacent orthogonal spaces: D-5 (north) and E-6 (east)
    const boardWithEnemies = createBoardWithUnits([
      placed(createTestUnit('white', { attack: 3 }), 'D-5', 'north'),
      placed(
        createTestUnit('white', { attack: 3, instanceNumber: 2 }),
        'E-6',
        'north',
      ),
    ]);
    expect(diagonalIsClear('black', boardWithEnemies, coordinate, 'D-6')).toBe(
      false,
    );
  });

  it('is clear on a different diagonal when only one intervening space holds an enemy', () => {
    // SouthWest at E-5 has adjacent orthogonal spaces: F-5 (south) and E-4 (west)
    const boardWithEnemies = createBoardWithUnits([
      placed(createTestUnit('white', { attack: 3 }), 'F-5', 'north'),
    ]);
    expect(diagonalIsClear('black', boardWithEnemies, coordinate, 'F-4')).toBe(
      true,
    );
  });

  it('stays clear when friendlies occupy both intervening spaces', () => {
    const boardWithFriendlies = createBoardWithUnits([
      placed(createTestUnit('black', { attack: 3 }), 'D-5', 'north'),
      placed(
        createTestUnit('black', { attack: 3, instanceNumber: 2 }),
        'E-6',
        'north',
      ),
    ]);
    expect(
      diagonalIsClear('black', boardWithFriendlies, coordinate, 'D-6'),
    ).toBe(true);
  });

  it('stays clear when one intervening space is friendly and the other is an enemy', () => {
    const boardWithMixed = createBoardWithUnits([
      placed(createTestUnit('black', { attack: 3 }), 'D-5', 'north'),
      placed(createTestUnit('white', { attack: 3 }), 'E-6', 'north'),
    ]);
    expect(diagonalIsClear('black', boardWithMixed, coordinate, 'D-6')).toBe(
      true,
    );
  });
});
