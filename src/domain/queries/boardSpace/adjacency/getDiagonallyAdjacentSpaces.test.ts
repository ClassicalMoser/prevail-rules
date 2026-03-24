import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getDiagonallyAdjacentSpaces } from './getDiagonallyAdjacentSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * getDiagonallyAdjacentSpaces: up to four diagonally adjacent coordinates (no orthogonals).
 */
describe('getDiagonallyAdjacentSpaces', () => {
  it('given interior coordinate, returns four diagonals', () => {
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'E-5')).toEqual(
      new Set(['D-4', 'D-6', 'F-4', 'F-6']),
    );
  });

  it('given edge coordinate, returns fewer diagonals', () => {
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'A-5')).toEqual(
      new Set(['B-4', 'B-6']),
    );
  });

  it('given corner coordinate, returns one diagonal', () => {
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'L-18')).toEqual(
      new Set(['K-17']),
    );
  });

  it('given interior coordinate, excludes orthogonals', () => {
    const result = getDiagonallyAdjacentSpaces(standardBoard, 'E-5');
    expect(result.has('D-5')).toBe(false);
    expect(result.has('E-4')).toBe(false);
    expect(result.has('E-6')).toBe(false);
    expect(result.has('F-5')).toBe(false);
  });
});
