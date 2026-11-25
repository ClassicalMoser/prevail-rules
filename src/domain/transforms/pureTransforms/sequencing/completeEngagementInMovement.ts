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
  // The engagement the moving unit walked into; outside a move that has
  // reached one, this throws.
  const engagementState = getEngagementStateFromMovement(state);

  // Each engagement is set up in full as the move that made it resolves
  // (§6.3, edge case): a front defender has fallen back or stood, a flanked
  // one has been turned, a rear one has routed. Marking it complete is what
  // lets the move itself be finished.
  const updated = updateEngagementStateInMovement(state, {
    ...engagementState,
    completed: true,
  });

  // The move, with its engagement settled.
  return updated;
}
