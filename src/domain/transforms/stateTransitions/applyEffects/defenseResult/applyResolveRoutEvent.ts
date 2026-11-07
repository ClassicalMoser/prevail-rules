import type { ResolveRoutEvent } from '@events';
import type { GameState, RoutState } from '@game';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getCurrentRallyResolutionState,
  getRoutStateFromAttackApply,
  getRoutStateFromRally,
  getRoutStateFromRearEngagement,
} from '@queries';
import { updateRoutState } from '@transforms/pureTransforms';

/**
 * Applies a ResolveRoutEvent to the game state.
 * Sets the numberToDiscard on the rout state based on the penalty.
 * The penalty is the sum of all routed units' rout penalties.
 * A zero penalty is not a choice — the rout closes in the same write.
 *
 * @param event - The resolve rout event to apply
 * @param state - The current game state
 * @returns A new game state with the rout penalty set
 */
export function applyResolveRoutEvent<S extends GameState>(
  event: ResolveRoutEvent,
  state: S,
): S {
  let currentRoutState: RoutState;

  switch (event.routResolutionSource) {
    case 'rangedAttack': {
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      currentRoutState = getRoutStateFromAttackApply(attackApplyState);
      break;
    }
    case 'melee': {
      const routedUnit = event.unitInstances.values().next().value;
      const meleePlayer = routedUnit?.playerSide;
      if (meleePlayer === undefined) {
        throw new Error(
          'Melee rout resolution requires at least one unit instance',
        );
      }
      const attackApplyState = getAttackApplyStateFromMelee(state, meleePlayer);
      currentRoutState = getRoutStateFromAttackApply(attackApplyState);
      break;
    }
    case 'rally': {
      const rallyState = getCurrentRallyResolutionState(state);
      currentRoutState = getRoutStateFromRally(rallyState);
      break;
    }
    case 'rearEngagementMovement': {
      currentRoutState = getRoutStateFromRearEngagement(state);
      break;
    }
    default: {
      const _exhaustive: never = event.routResolutionSource;
      throw new Error(`Unknown rout resolution source: ${_exhaustive}`);
    }
  }

  // A zero penalty has nothing to choose, so the rout finishes here.
  const closesWithoutDiscard = event.penalty === 0;
  const newRoutState: RoutState = {
    ...currentRoutState,
    cardsChosen: closesWithoutDiscard ? true : currentRoutState.cardsChosen,
    completed: closesWithoutDiscard ? true : currentRoutState.completed,
    numberToDiscard: event.penalty,
  };

  return updateRoutState(state, newRoutState);
}
