import type { Board, Coordinate } from '@entities';
import type { MovementResolutionState } from '@game';
import { moveCommanderOnBoard } from './moveCommanderOnBoard';

/**
 * A commander who rides with a moving unit ends in the unit's final space
 * (§4.3.10). The ride was declared on the move; this carries it out, from
 * the space the unit set off from to the one it lands on. Riding into an
 * engagement is allowed: the one way a commander comes to share a space
 * with an enemy, committed to the fight.
 *
 * A commander who stays behind is left where it stands.
 */
export function carryRidingCommander(
  board: Board,
  movement: MovementResolutionState,
  landing: Coordinate,
): Board {
  if (movement.moveCommander !== true) {
    return board;
  }
  const carried = moveCommanderOnBoard(
    board,
    movement.movingUnit.unit.playerSide,
    movement.movingUnit.placement.coordinate,
    landing,
  );
  return carried;
}
