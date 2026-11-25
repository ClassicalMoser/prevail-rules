import { createEmptyStandardBoard } from '@factories';

import { getOrthogonallyAdjacentSpaces } from './getOrthogonallyAdjacentSpaces';

/**
 * The spaces touching a space along a side: up to four, straight north,
 * east, south and west.
 */
describe('getOrthogonallyAdjacentSpaces function', () => {
  // The standard board, rows A to L and columns 1 to 18.
  const standardBoard = createEmptyStandardBoard();

  it('is the four side neighbours of a space in mid-board', () => {
    // E-5's four straight neighbours, and none of its diagonals.
    expect(getOrthogonallyAdjacentSpaces(standardBoard, 'E-5')).toStrictEqual(
      new Set(['D-5', 'E-4', 'E-6', 'F-5']),
    );
  });

  it('is three beside an edge', () => {
    // A-5 has nothing north of it.
    expect(getOrthogonallyAdjacentSpaces(standardBoard, 'A-5')).toStrictEqual(
      new Set(['A-4', 'A-6', 'B-5']),
    );
  });

  it('is two in a corner', () => {
    // L-18 has nothing south or east of it.
    expect(getOrthogonallyAdjacentSpaces(standardBoard, 'L-18')).toStrictEqual(
      new Set(['K-18', 'L-17']),
    );
  });
});
