import { createEmptyStandardBoard } from '@factories';

import { getBackSpaces } from './getBackSpaces';

/**
 * A unit's back spaces are three (§2.3.2): the three behind it, opposite its
 * front. A friend there lends the fighter no melee support (§7.3.1), and an
 * enemy there facing the unit cuts off its retreat (§9.1.5).
 */
describe('getBackSpaces function', () => {
  // The standard board, rows A to L and columns 1 to 18.
  const standardBoard = createEmptyStandardBoard();

  it('is the row of three behind for a unit facing north', () => {
    // South of E-5: F-5 straight behind, F-4 and F-6 to either side.
    expect(getBackSpaces(standardBoard, 'E-5', 'north')).toStrictEqual(
      new Set(['F-4', 'F-5', 'F-6']),
    );
  });

  it('is the corner of three behind for a unit facing a diagonal', () => {
    // A unit facing north-east at E-5 has its back to the south-west: F-4
    // straight behind, F-5 (south) and E-4 (west) to either side.
    expect(getBackSpaces(standardBoard, 'E-5', 'northEast')).toStrictEqual(
      new Set(['E-4', 'F-4', 'F-5']),
    );
  });

  it('is empty for a unit in a corner facing out across the board', () => {
    // At A-1 facing south-east, everything behind it is off the board.
    expect(getBackSpaces(standardBoard, 'A-1', 'southEast')).toStrictEqual(
      new Set(),
    );
  });
});
