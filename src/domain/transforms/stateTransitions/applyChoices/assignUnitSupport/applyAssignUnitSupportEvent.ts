import type { AssignUnitSupportEvent } from '@events';
import type { GameState } from '@game';
import { getPlayerUnitsOnBoard, hasUnitInArray } from '@queries';
// TODO(composition): this reaches into `applyEffects/cards/` past its root
// barrel, which its README names as the only entry, for a helper that is not a
// game-effect apply and that nothing else calls. It also walks the player's
// board units a second time to find the ones named here. Settle by moving the
// helper beside this apply (or into `pureTransforms/` as the support check's
// rout) and passing it the units once.
import { applyUnitsLostSupportAfterRally } from '@transforms/stateTransitions/applyEffects/cards/applyUnitsLostSupportAfterRally';

/**
 * Applies an AssignUnitSupportEvent:
 * covered units stay; board units not in any assignment lose support and rout.
 *
 * Event is assumed pre-validated via `isValidAssignUnitSupportEvent`.
 */
export function applyAssignUnitSupportEvent<S extends GameState>(
  event: AssignUnitSupportEvent,
  state: S,
): S {
  // Each unit the player gave a place in a stack is held together by the
  // hand's cards (§10.4.4). A unit takes only one place, and validation has
  // checked the assignments, so each is a unit to keep.
  const covered = event.assignments.map(({ unit }) => unit);

  // Every unit on the player's board needs a place; whichever got none is
  // left over (§10.4.6). Units are matched by who they are, not by the copy
  // the event carries.
  const boardUnits = [...getPlayerUnitsOnBoard(state, event.player)];
  const uncovered = boardUnits.filter((unit) => !hasUnitInArray(covered, unit));

  // Anything left over routs, all at once, and its Morale is owed together
  // (§10.4.6, §10.4.7). With nothing left over, cleanup moves on.
  const supported = applyUnitsLostSupportAfterRally(
    state,
    event.player,
    uncovered,
  );
  return supported;
}
