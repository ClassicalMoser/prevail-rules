import type { Coordinate } from '@ruleValues';
import type { GameState, MovementResolutionState } from '@game';
import { moveCommanderOnBoard } from './moveCommanderOnBoard';

/**
 * A commander who rides with a moving unit ends in the unit's final space
 * (§4.3.10). The ride was declared on the move, from the space the unit set
 * off from, and the commander has stood there since; this carries it out to
 * the space the unit lands on. Riding into an engagement is allowed: the one
 * way a commander comes to share a space with an enemy, committed to the
 * fight.
 *
 * A commander who stays behind is left where it stands.
 *
 * @param state - The game, the unit already landed
 * @param movement - The move, which says whether the commander rides
 * @param landing - The space the unit landed on
 * @returns The state with a riding commander at the landing, and filed there; otherwise unchanged
 */
export function carryRidingCommander<S extends GameState>(
  state: S,
  movement: MovementResolutionState,
  landing: Coordinate,
): S {
  // A commander who did not ride stays where it is.
  if (movement.moveCommander !== true) {
    return state;
  }

  // It goes with the unit to where the unit landed.
  const carried = moveCommanderOnBoard(
    state,
    movement.movingUnit.playerSide,
    landing,
  );
  return carried;
}
