import type { GameState } from '@game';
import { getEngagementStateFromMovement } from '@queries';
import { updateEngagementStateInMovement } from './updateEngagementStateInMovement';

/**
 * Marks the engagement under way as finished, ready for its movement to
 * carry on (§6.3).
 *
 * @param state - The game state, with an engagement under way
 * @returns The game state with that engagement complete
 */
export function completeEngagementInMovement<S extends GameState>(state: S): S {
  const engagementState = getEngagementStateFromMovement(state);
  const updated = updateEngagementStateInMovement(state, {
    ...engagementState,
    completed: true,
  });
  return updated;
}
