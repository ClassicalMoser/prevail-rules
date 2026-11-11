import type { Coordinate, Restrictions } from '@entities';
import { createBoardWithFacingRow, createTestUnit } from '@testing';

import { findRankSpanBetweenEnds } from './findRankSpanBetweenEnds';

const unrestricted: Restrictions = {
  inspirationRangeRestriction: -1,
  restrictionType: 'none',
};

/**
 * A line is a stretch of an unbroken rank, named by its two ends in either
 * order (§4.3.5).
 */
describe('findRankSpanBetweenEnds function', () => {
  const coordinates: Coordinate[] = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5'];
  const { board, unitAt } = createBoardWithFacingRow({ coordinates });

  it('finds the stretch between two ends whichever is named first', () => {
    const span = findRankSpanBetweenEnds(
      board,
      [unitAt('E-4').unit, unitAt('E-2').unit],
      unrestricted,
      [],
    );

    expect(span).toMatchObject({ from: 1, to: 3 });
    expect(span?.rank).toHaveLength(5);
  });

  it('finds a span of one when the same unit is named at both ends', () => {
    const span = findRankSpanBetweenEnds(
      board,
      [unitAt('E-3').unit, unitAt('E-3').unit],
      unrestricted,
      [],
    );

    expect(span).toMatchObject({ from: 2, to: 2 });
  });

  it('answers undefined when the second end is not in the first one’s rank', () => {
    const elsewhere = createTestUnit('black', { attack: 3, instanceNumber: 9 });

    expect(
      findRankSpanBetweenEnds(
        board,
        [unitAt('E-1').unit, elsewhere],
        unrestricted,
        [],
      ),
    ).toBeUndefined();
  });

  it('answers undefined when the first end is not on the board', () => {
    const elsewhere = createTestUnit('black', { attack: 3, instanceNumber: 9 });

    expect(
      findRankSpanBetweenEnds(
        board,
        [elsewhere, unitAt('E-1').unit],
        unrestricted,
        [],
      ),
    ).toBeUndefined();
  });
});
