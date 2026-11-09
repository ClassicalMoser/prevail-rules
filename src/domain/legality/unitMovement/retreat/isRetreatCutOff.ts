import type { Board, UnitWithPlacement } from '@entities';
import {
  getBackSpaces,
  getBoardSpace,
  getFrontSpaces,
  hasSingleUnit,
  isFriendlyUnit,
} from '@queries';

/**
 * Whether a unit's line of withdrawal is cut (§9.1.5): an unengaged enemy
 * stands in one of its back spaces, facing it. A unit caught like that
 * cannot retreat at all, however much open ground lies beyond — and a unit
 * that must retreat and cannot, routs (§9.1.6).
 *
 * @param board - The board the retreat would be made on
 * @param unitWithPlacement - The retreating unit and where it stands
 * @returns Whether an enemy behind has cut the unit's retreat
 */
export function isRetreatCutOff(
  board: Board,
  unitWithPlacement: UnitWithPlacement,
): boolean {
  const { placement, unit } = unitWithPlacement;
  const backSpaces = getBackSpaces(
    board,
    placement.coordinate,
    placement.facing,
  );

  for (const space of backSpaces) {
    const presence = getBoardSpace(board, space).unitPresence;
    // Only a lone enemy bars the way: an engaged one is busy with its own
    // fight, and a friend is no obstacle to falling back.
    if (
      !hasSingleUnit(presence) ||
      isFriendlyUnit(presence.unit, unit.playerSide)
    ) {
      continue;
    }
    // And only if it is facing the retreating unit — an enemy looking away
    // has not closed the road.
    const enemyFront = getFrontSpaces(board, space, presence.facing);
    if (enemyFront.has(placement.coordinate)) {
      return true;
    }
  }
  return false;
}
