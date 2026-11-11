import type {
  Board,
  Restrictions,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import { findUnitIndex } from '@queries/unit';
import { findPositionOfUnit } from '@queries/unitPresence';

import { getLineSegmentContainingUnit } from './getLineSegmentContainingUnit';

/** The stretch of an unbroken rank between two units, ends included. */
export interface RankSpan {
  /** The whole unbroken rank both ends stand in, in rank order. */
  rank: UnitWithPlacement[];
  /** The position of the span's first unit in the rank. */
  from: number;
  /** The position of the span's last unit in the rank. */
  to: number;
}

/**
 * Where two units stand in one unbroken rank (§4.3.5), whichever way they are
 * named: the rank through the first, and the stretch of it between them. The
 * rank is the one statement of who qualifies, so a unit that cannot stand in
 * the first one's line is not in it.
 *
 * @param board - The board state
 * @param ends - The two units; the same unit twice for a rank of one
 * @param restrictions - The order's restrictions; members must match its traits and types
 * @param commandedUnits - Units already commanded this round
 * @returns The rank and the stretch between the ends, or `undefined` when the
 * first end is off the board or the second is not in its rank
 */
export function findRankSpanBetweenEnds(
  board: Board,
  ends: readonly [UnitInstance, UnitInstance],
  restrictions: Restrictions,
  commandedUnits: readonly UnitInstance[],
): RankSpan | undefined {
  const [oneEnd, otherEnd] = ends;
  const placement = findPositionOfUnit(board, oneEnd);
  if (placement === undefined) {
    return undefined;
  }

  const rank = getLineSegmentContainingUnit(
    board,
    { placement, unit: oneEnd },
    restrictions,
    commandedUnits,
  );
  const oneIndex = findUnitIndex(rank, oneEnd);
  const otherIndex = findUnitIndex(rank, otherEnd);
  if (oneIndex === undefined || otherIndex === undefined) {
    return undefined;
  }

  const span: RankSpan = {
    from: Math.min(oneIndex, otherIndex),
    rank,
    to: Math.max(oneIndex, otherIndex),
  };
  return span;
}
