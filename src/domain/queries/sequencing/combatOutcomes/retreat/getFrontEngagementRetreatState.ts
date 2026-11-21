import type { GameState, RetreatState } from '@game';
import { getFrontEngagementStateFromMovement } from '@queries/engagement';
import { throwIfBypassed, throwIfPending } from '@utils';

/**
 * Gets the retreat state nested under a front engagement in movement CRS.
 *
 * @param state - The game state
 * @returns The retreat state
 * @throws Error if not in a front engagement, or when the defender has not
 * fallen back
 */
export function getFrontEngagementRetreatState(state: GameState): RetreatState {
  const engagementState = getFrontEngagementStateFromMovement(state);
  const retreatState = throwIfBypassed(
    throwIfPending(
      engagementState.engagementResolutionState.retreatState,
      'No retreat state found in front engagement',
    ),
    'The defender stood; no retreat in front engagement',
  );
  return retreatState;
}
