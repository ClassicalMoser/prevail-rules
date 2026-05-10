import { createEmptyStandardBoard } from '@transforms';

import { getDiagonallyAdjacentSpaces } from './getDiagonallyAdjacentSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * GetDiagonallyAdjacentSpaces: up to four diagonally adjacent coordinates (no orthogonals).
 */
describe(getDiagonallyAdjacentSpaces, () => {
  it('given interior coordinate, returns four diagonals', () => {
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'E-5')).toStrictEqual(
      new Set(['D-4', 'D-6', 'F-4', 'F-6']),
    );
  });

  it('given edge coordinate, returns fewer diagonals', () => {
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'A-5')).toStrictEqual(
      new Set(['B-4', 'B-6']),
    );
  });

  it('given corner coordinate, returns one diagonal', () => {
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'L-18')).toStrictEqual(
      new Set(['K-17']),
    );
  });

  it('given interior coordinate, excludes orthogonals', () => {
    const result = getDiagonallyAdjacentSpaces(standardBoard, 'E-5');
    expect(result.has('D-5')).toBeFalsy();
    expect(result.has('E-4')).toBeFalsy();
    expect(result.has('E-6')).toBeFalsy();
    expect(result.has('F-5')).toBeFalsy();
  });
});
