import type { GameState, RearEngagementResolutionState } from '@game';
import { getRearEngagementStateFromMovement } from '@queries';
import { updateEngagementStateInMovement } from './updateEngagementStateInMovement';

/**
 * Changes what a rear engagement has settled (§6.3.3): the rout it forces on
 * the defender. The rest of the engagement is kept.
 *
 * @param state - The game state, with a rear engagement under way
 * @param changes - The fields of the rear engagement's resolution to replace
 * @returns The game state with those fields replaced
 * @throws Error when the engagement under way is not from the rear
 */
export function updateRearEngagementResolutionState<S extends GameState>(
  state: S,
  changes: Partial<RearEngagementResolutionState>,
): S {
  // The rear engagement the move walked into; a front or flank one here is
  // a fault in the caller, and this throws.
  const engagementState = getRearEngagementStateFromMovement(state);

  // A defender caught from behind routs at once (§6.3.3); the rout and
  // whether it is done are what change. Only what the caller changes is
  // replaced.
  const updated = updateEngagementStateInMovement(state, {
    ...engagementState,
    engagementResolutionState: {
      ...engagementState.engagementResolutionState,
      ...changes,
    },
  });

  // The move, holding the rear engagement as it now stands.
  return updated;
}
