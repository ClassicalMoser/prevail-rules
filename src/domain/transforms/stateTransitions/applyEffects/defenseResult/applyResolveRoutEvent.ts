import type { Board } from "@entities";
import type { ResolveRoutEvent } from "@events";
import type { GameStateForBoard, RoutState } from "@game";
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getCurrentRallyResolutionState,
  getRoutStateFromAttackApply,
  getRoutStateFromRally,
  getRoutStateFromRearEngagement,
} from "@queries";
import { updateRoutState } from "@transforms/pureTransforms";

/**
 * Applies a ResolveRoutEvent to the game state.
 * Sets the numberToDiscard on the rout state based on the penalty.
 * The penalty is the sum of all routed units' rout penalties.
 *
 * @param event - The resolve rout event to apply
 * @param state - The current game state
 * @returns A new game state with the rout penalty set
 */
export function applyResolveRoutEvent<TBoard extends Board>(
  event: ResolveRoutEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  let currentRoutState: RoutState;

  switch (event.routResolutionSource) {
    case "rangedAttack": {
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      currentRoutState = getRoutStateFromAttackApply(attackApplyState);
      break;
    }
    case "melee": {
      const routedUnit = event.unitInstances.values().next().value;
      const meleePlayer = routedUnit?.playerSide;
      if (meleePlayer === undefined) {
        throw new Error("Melee rout resolution requires at least one unit instance");
      }
      const attackApplyState = getAttackApplyStateFromMelee(state, meleePlayer);
      currentRoutState = getRoutStateFromAttackApply(attackApplyState);
      break;
    }
    case "rally": {
      const rallyState = getCurrentRallyResolutionState(state);
      currentRoutState = getRoutStateFromRally(rallyState);
      break;
    }
    case "rearEngagementMovement": {
      currentRoutState = getRoutStateFromRearEngagement(state);
      break;
    }
  }

  const newRoutState: RoutState = {
    ...currentRoutState,
    numberToDiscard: event.penalty,
  };

  return updateRoutState(state, newRoutState);
}
