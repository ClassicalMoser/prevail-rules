import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getDiagonallyAdjacentSpaces } from './getDiagonallyAdjacentSpaces';

const standardBoard = createEmptyStandardBoard();

describe('getDiagonallyAdjacentSpaces', () => {
  it('should return only the four diagonal adjacent spaces for a center coordinate', () => {
    // E-5 has diagonal neighbors: D-4 (northWest), D-6 (northEast), F-4 (southWest), F-6 (southEast)
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'E-5')).toEqual(
      new Set(['D-4', 'D-6', 'F-4', 'F-6']),
    );
  });

  it('should return fewer spaces for edge coordinates', () => {
    // A-1 has diagonal neighbor: B-2 (southEast)
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'A-5')).toEqual(
      new Set(['B-4', 'B-6']),
    );
  });

  it('should return fewer spaces for corner coordinates', () => {
    // L-18 has diagonal neighbor: K-17 (northWest)
    expect(getDiagonallyAdjacentSpaces(standardBoard, 'L-18')).toEqual(
      new Set(['K-17']),
    );
  });

  it('should not include orthogonal spaces', () => {
    const result = getDiagonallyAdjacentSpaces(standardBoard, 'E-5');
    // Should not include orthogonal spaces like D-5, E-6, F-5, E-4
    expect(result.has('D-5')).toBe(false);
    expect(result.has('E-4')).toBe(false);
    expect(result.has('E-6')).toBe(false);
    expect(result.has('F-5')).toBe(false);
  });
});
