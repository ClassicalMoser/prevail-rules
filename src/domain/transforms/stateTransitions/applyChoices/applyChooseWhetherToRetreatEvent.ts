import type { ChooseWhetherToRetreatEvent } from '@events';
import type { GameState } from '@game';
import { getFrontEngagementStateFromMovement } from '@queries';
import { updateEngagementStateInMovement } from '@transforms/pureTransforms';

/**
 * Applies a ChooseWhetherToRetreatEvent to the game state.
 * Updates the defendingUnitRetreats flag in the front engagement resolution state.
 * Event is assumed pre-validated (issueCommands phase, movement with front engagement).
 *
 * @param event - The choose whether to retreat event to apply
 * @param state - The current game state
 * @returns A new game state with the retreat decision recorded
 */
export function applyChooseWhetherToRetreatEvent<S extends GameState>(
  event: ChooseWhetherToRetreatEvent,
  state: S,
): S {
  const engagementState = getFrontEngagementStateFromMovement(state);

  // Decline retreat → engagement complete (units stay for Phase 4 melee).
  // Accept retreat → defendingUnitRetreated stays pending for chooseRetreatOption.
  const newEngagementState = {
    ...engagementState,
    completed: event.choosesToRetreat ? engagementState.completed : true,
    engagementResolutionState: {
      ...engagementState.engagementResolutionState,
      defendingUnitRetreated: event.choosesToRetreat
        ? engagementState.engagementResolutionState.defendingUnitRetreated
        : false,
      defendingUnitRetreats: event.choosesToRetreat,
    },
  };

  return updateEngagementStateInMovement(state, newEngagementState);
}
