import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getOrthogonallyAdjacentSpaces } from './getOrthogonallyAdjacentSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * getOrthogonallyAdjacentSpaces: up to four cardinally adjacent coordinates (no diagonals).
 */
describe('getOrthogonallyAdjacentSpaces', () => {
  it('given interior coordinate, returns four orthogonals', () => {
    expect(getOrthogonallyAdjacentSpaces(standardBoard, 'E-5')).toEqual(
      new Set(['D-5', 'E-6', 'F-5', 'E-4']),
    );
  });

  it('given edge coordinate, returns fewer orthogonals', () => {
    expect(getOrthogonallyAdjacentSpaces(standardBoard, 'A-5')).toEqual(
      new Set(['B-5', 'A-4', 'A-6']),
    );
  });

  it('given corner coordinate, returns two orthogonals', () => {
    expect(getOrthogonallyAdjacentSpaces(standardBoard, 'L-18')).toEqual(
      new Set(['K-18', 'L-17']),
    );
  });

  it('given interior coordinate, excludes diagonals', () => {
    const result = getOrthogonallyAdjacentSpaces(standardBoard, 'E-5');
    expect(result.has('D-4')).toBe(false);
    expect(result.has('D-6')).toBe(false);
    expect(result.has('F-4')).toBe(false);
    expect(result.has('F-6')).toBe(false);
  });
});
