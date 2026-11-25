import type { GameState } from '@game';
import type { Restrictions, UnitInstance, UnitWithPlacement } from '@entities';
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
 * @param gameState - The game, for where the ends stand and the board
 * @param ends - The two units; the same unit twice for a rank of one
 * @param restrictions - The order's restrictions; members must match its traits and types
 * @param commandedUnits - Units already commanded this round
 * @returns The rank and the stretch between the ends, or `undefined` when the
 * first end is off the board or the second is not in its rank
 */
export function findRankSpanBetweenEnds(
  gameState: GameState,
  ends: readonly [UnitInstance, UnitInstance],
  restrictions: Restrictions,
  commandedUnits: readonly UnitInstance[],
): RankSpan | undefined {
  // The rank is drawn through the first end, so it must stand on the board.
  const [oneEnd, otherEnd] = ends;
  const placement = findPositionOfUnit(gameState, oneEnd);
  if (placement === undefined) {
    return undefined;
  }

  // The unbroken rank through the first end, by the one statement of who may
  // stand in a line under this order.
  const rank = getLineSegmentContainingUnit(
    gameState.boardState,
    { placement, unit: oneEnd },
    restrictions,
    commandedUnits,
  );
  // Where each end stands in that rank. A second end outside it is beyond a
  // gap, an enemy, a unit that may not join, or not in this rank at all.
  // TODO(composition): `oneIndex` is never `undefined`, as the rank always
  // holds the unit it was drawn from (`getLineSegmentContainingUnit` starts
  // from it), so that half of the test is unreachable and its mutant survives;
  // `getLegalLines` treats the same lookup as a fault (`throwIfUndefined`).
  // Settled by doing the same here.
  const oneIndex = findUnitIndex(rank, oneEnd);
  const otherIndex = findUnitIndex(rank, otherEnd);
  if (oneIndex === undefined || otherIndex === undefined) {
    return undefined;
  }

  // The stretch from the end nearer the rank's start to the farther one,
  // whichever order the ends were named in.
  const span: RankSpan = {
    from: Math.min(oneIndex, otherIndex),
    rank,
    to: Math.max(oneIndex, otherIndex),
  };

  // The rank and where in it the line runs.
  return span;
}
