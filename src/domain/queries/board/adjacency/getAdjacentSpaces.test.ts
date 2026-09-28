import { createEmptyStandardBoard } from '@factories';

import { getAdjacentSpaces } from './getAdjacentSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * GetAdjacentSpaces: all eight neighbors (orthogonal + diagonal) that exist on the board from a coordinate.
 */
describe('getAdjacentSpaces function', () => {
  it('corner A-1 has three in-bounds neighbors', () => {
    expect(getAdjacentSpaces(standardBoard, 'A-1')).toStrictEqual(
      new Set(['B-1', 'B-2', 'A-2']),
    );
  });

  it('an interior space at E-5 has all eight neighbors', () => {
    expect(getAdjacentSpaces(standardBoard, 'E-5')).toStrictEqual(
      new Set(['D-4', 'D-5', 'D-6', 'E-4', 'E-6', 'F-4', 'F-5', 'F-6']),
    );
  });

  it('an edge space at G-1 has five in-bounds neighbors', () => {
    expect(getAdjacentSpaces(standardBoard, 'G-1')).toStrictEqual(
      new Set(['F-1', 'F-2', 'G-2', 'H-1', 'H-2']),
    );
  });

  it('corner L-18 has three in-bounds neighbors', () => {
    expect(getAdjacentSpaces(standardBoard, 'L-18')).toStrictEqual(
      new Set(['K-18', 'K-17', 'L-17']),
    );
  });
});
