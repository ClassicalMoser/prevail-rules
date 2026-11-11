import type { FrontEngagementResolutionState, GameState } from '@game';
import { getFrontEngagementStateFromMovement } from '@queries';
import { updateEngagementStateInMovement } from './updateEngagementStateInMovement';

/**
 * Changes what a front engagement has settled (§6.3): the defender's
 * commitment, whether it can and does retreat, and the retreat itself. The
 * rest of the engagement is kept.
 *
 * @param state - The game state, with a front engagement under way
 * @param changes - The fields of the front engagement's resolution to replace
 * @returns The game state with those fields replaced
 * @throws Error when the engagement under way is not from the front
 */
export function updateFrontEngagementResolutionState<S extends GameState>(
  state: S,
  changes: Partial<FrontEngagementResolutionState>,
): S {
  const engagementState = getFrontEngagementStateFromMovement(state);
  const updated = updateEngagementStateInMovement(state, {
    ...engagementState,
    engagementResolutionState: {
      ...engagementState.engagementResolutionState,
      ...changes,
    },
  });
  return updated;
}
