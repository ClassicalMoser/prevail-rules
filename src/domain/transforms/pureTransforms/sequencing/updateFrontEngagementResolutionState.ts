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
  // The front engagement the move walked into; a flank or rear one here is
  // a fault in the caller, and this throws.
  const engagementState = getFrontEngagementStateFromMovement(state);

  // A front defender settles in parts, each written as it happens: its
  // commitment, whether it may and does fall back, and the retreat itself
  // (§6.3.2). Only what the caller changes is replaced.
  const updated = updateEngagementStateInMovement(state, {
    ...engagementState,
    engagementResolutionState: {
      ...engagementState.engagementResolutionState,
      ...changes,
    },
  });

  // The move, holding the front engagement as it now stands.
  return updated;
}
