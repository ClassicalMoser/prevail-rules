import type { GameState } from '@game';
import { findRearEngagementStateFromMovement } from '@queries';
import { completeEngagementInMovement } from './completeEngagementInMovement';
import { updateRearEngagementResolutionState } from './updateRearEngagementResolutionState';

/**
 * Ends a rear engagement once its rout is settled. A rear engagement is
 * nothing but the defender's rout (§6.3.3): when the Morale is paid — or
 * there was none to pay — the engagement is over and the move can finish.
 * Both ways a rout closes call this, so neither leaves the move hanging.
 *
 * Any other state passes through unchanged: a rout in a rally, a melee or
 * an attack has no rear engagement to end, and a rear rout still owed is
 * not over yet.
 *
 * @param state - The state just after a rout was written
 * @returns The state with the rear engagement marked complete, if its rout is
 */
export function closeRearEngagementWhenRouted<S extends GameState>(
  state: S,
): S {
  // Only a rear engagement whose rout is paid is ready to close.
  const rear = findRearEngagementStateFromMovement(state);
  if (
    rear === undefined ||
    !rear.engagementResolutionState.routState.completed
  ) {
    return state;
  }

  // The rout is paid: the rear engagement, and its resolution, are done.
  const closed = completeEngagementInMovement(
    updateRearEngagementResolutionState(state, { completed: true }),
  );
  return closed;
}
