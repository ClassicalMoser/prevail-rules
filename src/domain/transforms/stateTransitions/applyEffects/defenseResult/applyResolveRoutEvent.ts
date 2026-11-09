import type { ResolveRoutEvent } from '@events';
import type { GameState, RoutState } from '@game';
import { getRoutState } from '@queries';
import {
  closeRearEngagementWhenRouted,
  updateRetreatRoutState,
  updateRoutState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveRoutEvent to the game state.
 * Sets the numberToDiscard on the rout state based on the penalty.
 * The penalty is the sum of all routed units' rout penalties.
 * A zero penalty is not a choice — the rout closes in the same write.
 *
 * The routed units name their owner, and that owner names the rout, so reading
 * it needs no knowledge of where it sits. `routResolutionSource` is still
 * needed to write it back: a rout nested on a retreat is replaced through the
 * retreat holding it, and every other rout through its own parent.
 *
 * @param event - The resolve rout event to apply
 * @param state - The current game state
 * @returns A new game state with the rout penalty set
 */
export function applyResolveRoutEvent<S extends GameState>(
  event: ResolveRoutEvent,
  state: S,
): S {
  const routedUnit = event.unitInstances[0];
  if (routedUnit === undefined) {
    throw new Error('Rout resolution requires at least one unit instance');
  }
  const currentRoutState = getRoutState(state, routedUnit.playerSide);

  // A zero penalty has nothing to choose, so the rout finishes here.
  const closesWithoutDiscard = event.penalty === 0;
  const newRoutState: RoutState = {
    ...currentRoutState,
    cardsChosen: closesWithoutDiscard ? true : currentRoutState.cardsChosen,
    completed: closesWithoutDiscard ? true : currentRoutState.completed,
    numberToDiscard: event.penalty,
  };

  // A retreat with nowhere to go holds its own rout, and outlives the attack
  // that forced it, so the write goes through the retreat.
  if (event.routResolutionSource === 'retreat') {
    return updateRetreatRoutState(state, newRoutState);
  }
  const written = updateRoutState(state, newRoutState);
  // A zero penalty settles a rear engagement's rout here, and so ends the
  // engagement itself, as paying a discard would (§6.3.3).
  const closed = closeRearEngagementWhenRouted(written);
  return closed;
}
