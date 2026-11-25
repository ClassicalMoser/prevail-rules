import { createEmptyStandardBoard } from '@factories';

import { findRearwardSpace } from './findRearwardSpace';

/**
 * A retreat is a backward move (§9.1.1): each step goes one space against
 * the unit's facing, which keeps facing the same way. Past the board edge
 * at its back there is no space.
 */
describe('findRearwardSpace function', () => {
  // The standard board; a unit in mid-board at E-5 has room behind it.
  const standardBoard = createEmptyStandardBoard();

  it('steps back one row for a unit facing north', () => {
    // A north-facing unit at E-5 falls back south, to F-5.
    expect(findRearwardSpace(standardBoard, 'E-5', 'north')).toBe('F-5');
  });

  it('steps back along the diagonal for a unit facing a diagonal', () => {
    // A unit facing north-east at E-5 falls back south-west, to F-4.
    expect(findRearwardSpace(standardBoard, 'E-5', 'northEast')).toBe('F-4');
  });

  it('finds no space when the unit has its back to the board edge', () => {
    // A south-facing unit on row A has the north edge behind it.
    expect(findRearwardSpace(standardBoard, 'A-1', 'south')).toBeUndefined();
  });
});
