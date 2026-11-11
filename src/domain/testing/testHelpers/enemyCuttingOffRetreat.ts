import type { UnitWithPlacement } from '@entities';
import { createEmptyGameState } from '@factories';
import { getOtherPlayer, findRearwardSpace } from '@queries';
import { createUnitWithPlacement } from './unitWithPlacement';

/**
 * An enemy standing directly behind a unit and facing it: the one thing
 * that cuts a unit's line of withdrawal however much ground lies beyond
 * (§9.1.5). Stand it on the board, or pass it to `legalRetreatsOf`, to build
 * a unit that must retreat and cannot, and so routs (§9.1.6).
 *
 * @param unit - The unit whose retreat is cut, and where it stands
 * @returns An unengaged enemy in the space behind it, facing the same way, so its front is the unit's back
 * @throws Error when the unit's back is against the board edge, where it needs no enemy to be cut off
 */
export function enemyCuttingOffRetreat(
  unit: UnitWithPlacement,
): UnitWithPlacement {
  // Directly behind the unit, on the standard board.
  const board = createEmptyGameState('standard').boardState;
  const behind = findRearwardSpace(
    board,
    unit.placement.coordinate,
    unit.placement.facing,
  );
  if (behind === undefined) {
    throw new Error('The unit already has its back to the board edge');
  }
  // Facing the way the unit faces, it looks straight at the unit's back.
  const enemy = createUnitWithPlacement({
    coordinate: behind,
    facing: unit.placement.facing,
    playerSide: getOtherPlayer(unit.unit.playerSide),
  });
  return enemy;
}
