import { createEmptyStandardBoard } from '@factories';

import { getDiagonallyAdjacentSpaces } from './getDiagonallyAdjacentSpaces';

/**
 * The spaces touching a space only at a corner: up to four, one along each
 * diagonal. Melee support from one of these is lent only across an open
 * diagonal (§7.3.1).
 */
describe('getDiagonallyAdjacentSpaces function', () => {
  // The standard board, rows A to L and columns 1 to 18.
  const standardBoard = createEmptyStandardBoard();

  it('is the four corner neighbours of a space in mid-board', () => {
    // E-5's four diagonals, and none of its straight neighbours.
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'E-5')).toStrictEqual(
      new Set(['D-4', 'D-6', 'F-4', 'F-6']),
    );
  });

  it('is two beside an edge', () => {
    // A-5 has nothing to the north-west or north-east.
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'A-5')).toStrictEqual(
      new Set(['B-4', 'B-6']),
    );
  });

  it('is one in a corner', () => {
    // L-18's only diagonal on the board is north-west.
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'L-18')).toStrictEqual(
      new Set(['K-17']),
    );
  });
});
