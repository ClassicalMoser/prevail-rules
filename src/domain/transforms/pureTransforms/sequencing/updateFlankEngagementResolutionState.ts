import type { FlankEngagementResolutionState, GameState } from '@game';
import { getFlankEngagementStateFromMovement } from '@queries';
import { updateEngagementStateInMovement } from './updateEngagementStateInMovement';

/**
 * Changes what a flank engagement has settled (§6.3.4): whether the defender
 * has been turned to face the engaging unit. The rest of the engagement is
 * kept.
 *
 * @param state - The game state, with a flank engagement under way
 * @param changes - The fields of the flank engagement's resolution to replace
 * @returns The game state with those fields replaced
 * @throws Error when the engagement under way is not from the flank
 */
export function updateFlankEngagementResolutionState<S extends GameState>(
  state: S,
  changes: Partial<FlankEngagementResolutionState>,
): S {
  const engagementState = getFlankEngagementStateFromMovement(state);
  const updated = updateEngagementStateInMovement(state, {
    ...engagementState,
    engagementResolutionState: {
      ...engagementState.engagementResolutionState,
      ...changes,
    },
  });
  return updated;
}
