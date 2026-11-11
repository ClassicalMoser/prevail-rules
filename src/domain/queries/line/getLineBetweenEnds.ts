import type {
  Board,
  Restrictions,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';

import { findRankSpanBetweenEnds } from './findRankSpanBetweenEnds';

/**
 * The units of a line named by its two ends (§4.3.5): the stretch of the
 * unbroken rank from one end to the other, the ends included. The ends may be
 * named in either order, and a line of one names the same unit twice. The
 * order names only the ends; the board says who stands between them.
 *
 * @param board - The board state
 * @param ends - The two ends of the line
 * @param restrictions - The order's restrictions; every unit must match its traits and types
 * @param commandedUnits - Units already commanded this round
 * @returns The line's units, in rank order
 * @throws Error when the second end is not on the unbroken rank through the first
 */
export function getLineBetweenEnds(
  board: Board,
  ends: readonly [UnitInstance, UnitInstance],
  restrictions: Restrictions,
  commandedUnits: readonly UnitInstance[],
): UnitWithPlacement[] {
  const span = findRankSpanBetweenEnds(
    board,
    ends,
    restrictions,
    commandedUnits,
  );
  if (span === undefined) {
    throw new Error(
      'The two ends of the line do not stand on one unbroken rank',
    );
  }

  // Everything from one end to the other, whichever way they were named.
  const line = span.rank.slice(span.from, span.to + 1);
  return line;
}
