import { createEmptyStandardBoard } from '@factories';

import { getOrthogonallyAdjacentSpaces } from './getOrthogonallyAdjacentSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * GetOrthogonallyAdjacentSpaces: up to four cardinally adjacent coordinates (no diagonals).
 */
describe(getOrthogonallyAdjacentSpaces, () => {
  it('an interior space has four orthogonal neighbors', () => {
    expect(getOrthogonallyAdjacentSpaces(standardBoard, 'E-5')).toStrictEqual(
      new Set(['D-5', 'E-6', 'F-5', 'E-4']),
    );
  });

  it('an edge space has three orthogonal neighbors', () => {
    expect(getOrthogonallyAdjacentSpaces(standardBoard, 'A-5')).toStrictEqual(
      new Set(['B-5', 'A-4', 'A-6']),
    );
  });

  it('a corner has two orthogonal neighbors', () => {
    expect(getOrthogonallyAdjacentSpaces(standardBoard, 'L-18')).toStrictEqual(
      new Set(['K-18', 'L-17']),
    );
  });

  it("an interior space's orthogonal neighbors exclude the diagonals", () => {
    const result = getOrthogonallyAdjacentSpaces(standardBoard, 'E-5');
    expect(result.has('D-4')).toBe(false);
    expect(result.has('D-6')).toBe(false);
    expect(result.has('F-4')).toBe(false);
    expect(result.has('F-6')).toBe(false);
  });
});
