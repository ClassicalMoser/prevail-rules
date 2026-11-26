import type { FrontEngagementState, GameState } from '@game';
import { isPending } from '@utils';
import { findMovementResolutionState } from '../sequencing/commandResolution/findMovementResolutionState';

/**
 * The front engagement on the movement being carried out (§6.3.2), or
 * `undefined` when the movement has opened no engagement or opened a flank
 * or a rear one. `getFrontEngagementStateFromMovement` is the twin that
 * insists.
 *
 * @param state - The game state
 * @returns The front engagement, or `undefined`
 */
export function findFrontEngagementStateFromMovement(
  state: GameState,
): FrontEngagementState | undefined {
  // No Move order is being carried out, so no unit has walked into anyone.
  const movement = findMovementResolutionState(state);
  // 'pending' means this movement has not reached an engagement.
  if (movement === undefined || isPending(movement.engagementState)) {
    return undefined;
  }

  // The mover met the defender some other way: a flank or a rear engagement.
  const resolution = movement.engagementState.engagementResolutionState;
  if (resolution.engagementType !== 'front') {
    return undefined;
  }

  // `resolution` is a front engagement. Rebuilding the parent carries that type.
  const front = {
    ...movement.engagementState,
    engagementResolutionState: resolution,
  };

  // The front engagement this movement opened.
  return front;
}
