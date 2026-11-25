import { createEmptyStandardBoard } from '@factories';

import { getFrontSpaces } from './getFrontSpaces';

/**
 * A unit's front spaces are three (§2.3.2): the space it faces and the two
 * 45° to either side of it. Where it faces a board edge, fewer are on the
 * board.
 */
describe('getFrontSpaces function', () => {
  // The standard board, rows A to L and columns 1 to 18.
  const standardBoard = createEmptyStandardBoard();

  it('is the row of three ahead for a unit facing north', () => {
    // North of E-5: D-5 straight ahead, D-4 and D-6 to either side.
    expect(getFrontSpaces(standardBoard, 'E-5', 'north')).toStrictEqual(
      new Set(['D-4', 'D-5', 'D-6']),
    );
  });

  it('is the corner of three ahead for a unit facing a diagonal', () => {
    // North-east of E-5: D-6 straight ahead, D-5 (north) and E-6 (east) to
    // either side.
    expect(getFrontSpaces(standardBoard, 'E-5', 'northEast')).toStrictEqual(
      new Set(['D-5', 'D-6', 'E-6']),
    );
  });

  it('keeps only the front spaces on the board at a corner', () => {
    // South from A-1, the south-west space would be column 0.
    expect(getFrontSpaces(standardBoard, 'A-1', 'south')).toStrictEqual(
      new Set(['B-1', 'B-2']),
    );
  });

  it('is empty for a unit facing the board edge it stands on', () => {
    // North of row A there is nothing.
    expect(getFrontSpaces(standardBoard, 'A-5', 'north')).toStrictEqual(
      new Set(),
    );
  });
});
