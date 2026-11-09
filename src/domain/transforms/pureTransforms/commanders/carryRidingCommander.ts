import type { Board, Coordinate } from '@entities';
import type { MovementResolutionState } from '@game';
import { addCommanderToBoard } from './addCommanderToBoard';
import { removeCommanderFromBoard } from './removeCommanderFromBoard';

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
  const side = movement.movingUnit.unit.playerSide;
  const lifted = removeCommanderFromBoard(
    board,
    movement.movingUnit.placement.coordinate,
    side,
  );
  const carried = addCommanderToBoard(lifted, side, landing);
  return carried;
}
