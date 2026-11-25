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
  // The flank engagement the move walked into; a front or rear one here is
  // a fault in the caller, and this throws.
  const engagementState = getFlankEngagementStateFromMovement(state);

  // A flanked defender is turned to face the engaging unit and may not fall
  // back (§6.3.4); only what the caller changes is replaced, and the rest of
  // the engagement is kept.
  const updated = updateEngagementStateInMovement(state, {
    ...engagementState,
    engagementResolutionState: {
      ...engagementState.engagementResolutionState,
      ...changes,
    },
  });

  // The move, holding the flank engagement as it now stands.
  return updated;
}
