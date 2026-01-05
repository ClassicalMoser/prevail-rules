import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getOrthogonallyAdjacentSpaces } from './getOrthogonallyAdjacentSpaces';

const standardBoard = createEmptyStandardBoard();

describe('getOrthogonallyAdjacentSpaces', () => {
  it('should return only the four orthogonal adjacent spaces for a center coordinate', () => {
    // E-5 has orthogonal neighbors: D-5 (north), E-6 (east), F-5 (south), E-4 (west)
    expect(getOrthogonallyAdjacentSpaces(standardBoard, 'E-5')).toEqual(
      new Set(['D-5', 'E-6', 'F-5', 'E-4']),
    );
  });

  it('should return fewer spaces for edge coordinates', () => {
    // A-1 has orthogonal neighbors: B-1 (south), A-2 (east)
    expect(getOrthogonallyAdjacentSpaces(standardBoard, 'A-5')).toEqual(
      new Set(['B-5', 'A-4', 'A-6']),
    );
  });

  it('should return fewer spaces for corner coordinates', () => {
    // L-18 has orthogonal neighbors: K-18 (north), L-17 (west)
    expect(getOrthogonallyAdjacentSpaces(standardBoard, 'L-18')).toEqual(
      new Set(['K-18', 'L-17']),
    );
  });

  it('should not include diagonal spaces', () => {
    const result = getOrthogonallyAdjacentSpaces(standardBoard, 'E-5');
    // Should not include diagonal spaces like D-4, D-6, F-4, F-6
    expect(result.has('D-4')).toBe(false);
    expect(result.has('D-6')).toBe(false);
    expect(result.has('F-4')).toBe(false);
    expect(result.has('F-6')).toBe(false);
  });
});
