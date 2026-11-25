import { createEmptyStandardBoard } from '@factories';

import { getSpacesWithinDistance } from './getSpacesWithinDistance';

/**
 * Every space within a number of steps of a space, a diagonal step counting
 * as one (§2.4.2): a square around it, cut short by the board edge. "Within
 * 0 spaces" is the space itself.
 */
describe('getSpacesWithinDistance function', () => {
  // The standard board, rows A to L and columns 1 to 18.
  const standardBoard = createEmptyStandardBoard();

  it('is nothing for a negative distance', () => {
    // No space is fewer than no steps away.
    expect(getSpacesWithinDistance(standardBoard, 'E-5', -1)).toStrictEqual(
      new Set(),
    );
  });

  it('is the space itself for distance 0', () => {
    // "Within 0 spaces" means the same space (§2.4.2).
    expect(getSpacesWithinDistance(standardBoard, 'E-5', 0)).toStrictEqual(
      new Set(['E-5']),
    );
  });

  it('is the space and its eight neighbours for distance 1', () => {
    // E-5 and every space touching it, diagonals included.
    expect(getSpacesWithinDistance(standardBoard, 'E-5', 1)).toStrictEqual(
      new Set(['E-5', 'D-4', 'D-5', 'D-6', 'E-4', 'E-6', 'F-4', 'F-5', 'F-6']),
    );
  });

  it('is a five by five square for distance 2, its corners two diagonal steps out', () => {
    const result = getSpacesWithinDistance(standardBoard, 'E-5', 2);

    // Twenty-five spaces, from row C to row G and column 3 to column 7.
    expect(result.size).toBe(25);
    // Its corners are two diagonal steps away, the same as two straight.
    expect(result.has('C-3')).toBe(true);
    expect(result.has('C-7')).toBe(true);
    expect(result.has('G-3')).toBe(true);
    expect(result.has('G-7')).toBe(true);
    // One step past the square on each side is out of reach.
    expect(result.has('B-5')).toBe(false);
    expect(result.has('H-5')).toBe(false);
    expect(result.has('E-2')).toBe(false);
    expect(result.has('E-8')).toBe(false);
  });

  it('is cut short by the board edge at a corner', () => {
    // From A-1 only four of the nine spaces of the square are on the board.
    expect(getSpacesWithinDistance(standardBoard, 'A-1', 1)).toStrictEqual(
      new Set(['A-1', 'A-2', 'B-1', 'B-2']),
    );
  });
});
