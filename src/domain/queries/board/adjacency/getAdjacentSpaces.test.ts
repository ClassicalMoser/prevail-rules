import { createEmptyStandardBoard } from '@factories';

import { getAdjacentSpaces } from './getAdjacentSpaces';

/**
 * Adjacent means orthogonally or diagonally touching, up to eight spaces
 * (§2.4.1). By an edge or in a corner, fewer are on the board.
 */
describe('getAdjacentSpaces function', () => {
  // The standard board, rows A to L and columns 1 to 18.
  const standardBoard = createEmptyStandardBoard();

  it('is all eight around a space in mid-board', () => {
    // E-5 is touched on every side and at every corner.
    expect(getAdjacentSpaces(standardBoard, 'E-5')).toStrictEqual(
      new Set(['D-4', 'D-5', 'D-6', 'E-4', 'E-6', 'F-4', 'F-5', 'F-6']),
    );
  });

  it('is five beside an edge', () => {
    // G-1 has nothing west of it.
    expect(getAdjacentSpaces(standardBoard, 'G-1')).toStrictEqual(
      new Set(['F-1', 'F-2', 'G-2', 'H-1', 'H-2']),
    );
  });

  it('is three in a corner', () => {
    // A-1 has nothing north or west of it.
    expect(getAdjacentSpaces(standardBoard, 'A-1')).toStrictEqual(
      new Set(['A-2', 'B-1', 'B-2']),
    );
  });
});
