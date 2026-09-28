import { createEmptyStandardBoard } from '@factories';

import { getAdjacentSpaces } from './getAdjacentSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * GetAdjacentSpaces: all eight neighbors (orthogonal + diagonal) that exist on the board from a coordinate.
 */
describe(getAdjacentSpaces, () => {
  it('returns the three in-bounds neighbors of corner A-1', () => {
    expect(getAdjacentSpaces(standardBoard, 'A-1')).toStrictEqual(
      new Set(['B-1', 'B-2', 'A-2']),
    );
  });

  it('returns all eight neighbors of interior space E-5', () => {
    expect(getAdjacentSpaces(standardBoard, 'E-5')).toStrictEqual(
      new Set(['D-4', 'D-5', 'D-6', 'E-4', 'E-6', 'F-4', 'F-5', 'F-6']),
    );
  });

  it('returns the five in-bounds neighbors of edge space G-1', () => {
    expect(getAdjacentSpaces(standardBoard, 'G-1')).toStrictEqual(
      new Set(['F-1', 'F-2', 'G-2', 'H-1', 'H-2']),
    );
  });

  it('returns the three in-bounds neighbors of opposite corner L-18', () => {
    expect(getAdjacentSpaces(standardBoard, 'L-18')).toStrictEqual(
      new Set(['K-18', 'K-17', 'L-17']),
    );
  });
});
