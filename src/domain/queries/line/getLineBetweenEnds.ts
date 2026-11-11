import type {
  Board,
  Restrictions,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import { isSameUnitInstance } from '@queries/unit';
import { getPositionOfUnit } from '@queries/unitPresence';

import { getLineSegmentContainingUnit } from './getLineSegmentContainingUnit';

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
  const [oneEnd, otherEnd] = ends;

  // The unbroken rank through the one end.
  const rank = getLineSegmentContainingUnit(
    board,
    { placement: getPositionOfUnit(board, oneEnd), unit: oneEnd },
    restrictions,
    commandedUnits,
  );
  const oneIndex = rank.findIndex(
    (member) => isSameUnitInstance(member.unit, oneEnd).result,
  );
  const otherIndex = rank.findIndex(
    (member) => isSameUnitInstance(member.unit, otherEnd).result,
  );
  if (otherIndex === -1) {
    throw new Error(
      'The two ends of the line do not stand on one unbroken rank',
    );
  }

  // Everything from one end to the other, whichever way they were named.
  const line = rank.slice(
    Math.min(oneIndex, otherIndex),
    Math.max(oneIndex, otherIndex) + 1,
  );
  return line;
}
