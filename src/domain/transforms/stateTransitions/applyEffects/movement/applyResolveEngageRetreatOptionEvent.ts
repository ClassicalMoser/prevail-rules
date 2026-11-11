import type { ResolveEngageRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import { getFrontEngagementStateFromMovement } from '@queries';
import { updateEngagementStateInMovement } from '@transforms/pureTransforms';

/**
 * Applies a ResolveEngageRetreatOptionEvent to the game state.
 * Updates the defendingUnitCanRetreat flag in the front engagement resolution state.
 * Uses {@link getFrontEngagementStateFromMovement} (panicky narrowing) instead of a manual
 * front-type check.
 *
 * @param event - The resolve engage retreat option event to apply
 * @param state - The current game state
 * @returns A new game state with the retreat option resolved
 */
export function applyResolveEngageRetreatOptionEvent<S extends GameState>(
  event: ResolveEngageRetreatOptionEvent,
  state: S,
): S {
  const engagementState = getFrontEngagementStateFromMovement(state);
  const frontResolutionState = engagementState.engagementResolutionState;

  // Update front engagement resolution state with retreat option.
  // If the defender cannot retreat, engagement ends here (stay for Phase 4 melee).
  const newFrontResolutionState = {
    ...frontResolutionState,
    defendingUnitCanRetreat: event.defendingUnitCanRetreat,
    defendingUnitRetreats: event.defendingUnitCanRetreat
      ? frontResolutionState.defendingUnitRetreats
      : false,
  };

  const newEngagementState = {
    ...engagementState,
    completed: event.defendingUnitCanRetreat ? engagementState.completed : true,
    engagementResolutionState: newFrontResolutionState,
  };

  const updated = updateEngagementStateInMovement(state, newEngagementState);
  return updated;
}
