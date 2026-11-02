import type { GameState, RetreatState } from '@game';
import { getFrontEngagementStateFromMovement } from '@queries/engagement';
import { throwIfPending } from '@utils';

/**
 * Gets the retreat state nested under a front engagement in movement CRS.
 *
 * @param state - The game state
 * @returns The retreat state
 * @throws Error if not in front engagement or retreatState is still pending
 */
export function getRetreatStateFromFrontEngagement(
  state: GameState,
): RetreatState {
  const engagementState = getFrontEngagementStateFromMovement(state);
  const retreatState = throwIfPending(
    engagementState.engagementResolutionState.retreatState,
    'No retreat state found in front engagement',
  );
  return retreatState;
}
