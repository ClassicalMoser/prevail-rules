import { createEmptyStandardBoard } from '@transforms';

import { getAdjacentSpaces } from './getAdjacentSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * GetAdjacentSpaces: all eight neighbors (orthogonal + diagonal) that exist on the board from a coordinate.
 */
describe(getAdjacentSpaces, () => {
  it('given corner, interior, and opposite corner samples, returns expected neighbor sets', () => {
    expect(getAdjacentSpaces(standardBoard, 'A-1')).toStrictEqual(
      new Set(['B-1', 'B-2', 'A-2']),
    );
    expect(getAdjacentSpaces(standardBoard, 'E-5')).toStrictEqual(
      new Set(['D-4', 'D-5', 'D-6', 'E-4', 'E-6', 'F-4', 'F-5', 'F-6']),
    );
    expect(getAdjacentSpaces(standardBoard, 'L-18')).toStrictEqual(
      new Set(['K-18', 'K-17', 'L-17']),
    );
  });
});
