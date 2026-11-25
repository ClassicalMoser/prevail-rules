import type { Restrictions } from '@entities';
import type { Coordinate } from '@ruleValues';
import {
  createBoardWithFacingRow,
  createGameStateWithBoard,
  createTestUnit,
} from '@testing';

import { findRankSpanBetweenEnds } from './findRankSpanBetweenEnds';

// Inspiration range is asked of the line as a whole, not here, so an order
// with no limit and no filters is enough.
const unrestricted: Restrictions = {
  inspirationRangeRestriction: -1,
  restrictionType: 'none',
};

/**
 * A line is a stretch of an unbroken rank, named by its two ends in either
 * order (§4.3.5).
 */
describe('findRankSpanBetweenEnds function', () => {
  // A rank of five, E-1 to E-5, facing north.
  const coordinates: Coordinate[] = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5'];
  const { board, unitAt } = createBoardWithFacingRow({ coordinates });

  it('finds the stretch between two ends whichever is named first', () => {
    // E-4 is named before E-2.
    const span = findRankSpanBetweenEnds(
      createGameStateWithBoard(board),
      [unitAt('E-4').unit, unitAt('E-2').unit],
      unrestricted,
      [],
    );

    // E-2 to E-4 is the second to the fourth of the rank's five units.
    expect(span).toMatchObject({ from: 1, to: 3 });
    expect(span?.rank).toHaveLength(5);
  });

  it('finds a span of one when the same unit is named at both ends', () => {
    // A line of one names the same unit twice (§4.3.5).
    const span = findRankSpanBetweenEnds(
      createGameStateWithBoard(board),
      [unitAt('E-3').unit, unitAt('E-3').unit],
      unrestricted,
      [],
    );

    // E-3, the middle of the five, alone.
    expect(span).toMatchObject({ from: 2, to: 2 });
  });

  it('answers undefined when the second end is not in the first one’s rank', () => {
    // A unit that is not on the board at all stands on no rank with E-1.
    const elsewhere = createTestUnit('black', { attack: 3, instanceNumber: 9 });

    expect(
      findRankSpanBetweenEnds(
        createGameStateWithBoard(board),
        [unitAt('E-1').unit, elsewhere],
        unrestricted,
        [],
      ),
    ).toBeUndefined();
  });

  it('answers undefined when the first end is not on the board', () => {
    // With no first end on the board there is no rank to draw through it.
    const elsewhere = createTestUnit('black', { attack: 3, instanceNumber: 9 });

    expect(
      findRankSpanBetweenEnds(
        createGameStateWithBoard(board),
        [elsewhere, unitAt('E-1').unit],
        unrestricted,
        [],
      ),
    ).toBeUndefined();
  });

  it('answers undefined when a gap in the rank lies between the ends', () => {
    // E-1 and E-2 stand together; E-3 is empty, and E-4 stands beyond it.
    const { board: broken, unitAt: brokenAt } = createBoardWithFacingRow({
      coordinates: ['E-1', 'E-2', 'E-4'],
    });

    // A line is unbroken: no gaps (§4.3.5), so E-4 is not in E-1's rank.
    expect(
      findRankSpanBetweenEnds(
        createGameStateWithBoard(broken),
        [brokenAt('E-1').unit, brokenAt('E-4').unit],
        unrestricted,
        [],
      ),
    ).toBeUndefined();
  });
});
