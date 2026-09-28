import { createEmptyStandardBoard } from '@factories';

import { getDiagonallyAdjacentSpaces } from './getDiagonallyAdjacentSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * GetDiagonallyAdjacentSpaces: up to four diagonally adjacent coordinates (no orthogonals).
 */
describe('getDiagonallyAdjacentSpaces function', () => {
  it('an interior space has four diagonal neighbors', () => {
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'E-5')).toStrictEqual(
      new Set(['D-4', 'D-6', 'F-4', 'F-6']),
    );
  });

  it('an edge space has two diagonal neighbors', () => {
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'A-5')).toStrictEqual(
      new Set(['B-4', 'B-6']),
    );
  });

  it('a corner has one diagonal neighbor', () => {
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'L-18')).toStrictEqual(
      new Set(['K-17']),
    );
  });

  it("an interior space's diagonal neighbors exclude the orthogonals", () => {
    const result = getDiagonallyAdjacentSpaces(standardBoard, 'E-5');
    expect(result.has('D-5')).toBe(false);
    expect(result.has('E-4')).toBe(false);
    expect(result.has('E-6')).toBe(false);
    expect(result.has('F-5')).toBe(false);
  });
});
