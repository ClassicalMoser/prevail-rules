import type { Coordinate, Restrictions } from '@entities';
import { createBoardWithFacingRow, createTestUnit } from '@testing';

import { getLineBetweenEnds } from './getLineBetweenEnds';

// Inspiration range is not read here, so an order with no limit and no
// filters is enough.
const unrestricted: Restrictions = {
  inspirationRangeRestriction: -1,
  restrictionType: 'none',
};

/**
 * A line order names only the two ends of its line (§4.3.5); the units
 * between them are read off the board.
 */
describe('getLineBetweenEnds function', () => {
  // A rank of five, E-1 to E-5, facing north.
  const coordinates: Coordinate[] = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5'];
  const { board, unitAt } = createBoardWithFacingRow({ coordinates });

  it('gives every unit from one end to the other, the ends included', () => {
    const line = getLineBetweenEnds(
      board,
      [unitAt('E-2').unit, unitAt('E-4').unit],
      unrestricted,
      [],
    );

    expect(line.map((member) => member.placement.coordinate)).toStrictEqual([
      'E-2',
      'E-3',
      'E-4',
    ]);
  });

  it('gives the same line whichever end is named first', () => {
    const line = getLineBetweenEnds(
      board,
      [unitAt('E-4').unit, unitAt('E-2').unit],
      unrestricted,
      [],
    );

    // Still in rank order.
    expect(line.map((member) => member.placement.coordinate)).toStrictEqual([
      'E-2',
      'E-3',
      'E-4',
    ]);
  });

  it('gives a line of one when the same unit is named at both ends', () => {
    const line = getLineBetweenEnds(
      board,
      [unitAt('E-3').unit, unitAt('E-3').unit],
      unrestricted,
      [],
    );

    expect(line).toStrictEqual([unitAt('E-3')]);
  });

  it('throws when the second end is not on the rank through the first', () => {
    // A unit that is not on the board at all stands on no rank with E-1.
    const elsewhere = createTestUnit('black', { attack: 3, instanceNumber: 9 });

    expect(() =>
      getLineBetweenEnds(
        board,
        [unitAt('E-1').unit, elsewhere],
        unrestricted,
        [],
      ),
    ).toThrow('The two ends of the line do not stand on one unbroken rank');
  });
});
