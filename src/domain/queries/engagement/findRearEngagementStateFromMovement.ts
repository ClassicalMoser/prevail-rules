import type {
  EngagementState,
  GameState,
  RearEngagementResolutionState,
} from '@game';
import { isPending } from '@utils';
import { findMovementResolutionState } from '../sequencing/commandResolution/findMovementResolutionState';

/**
 * The rear engagement on the movement being carried out (§6.3.3), or
 * `undefined` when the movement has opened no engagement or opened a front or
 * a flank one. `getRearEngagementStateFromMovement` is the twin that insists.
 *
 * TODO(composition): nothing in production calls this; only a transforms spec
 * reads it. `routInCurrentContext` in `findRoutLocation` walks the same path
 * inline (no phase, no order, a Shoot, or a pending engagement all answer
 * `undefined` there too, and neither throws), and `getRearEngagementRoutState`
 * repeats `getRearEngagementStateFromMovement`'s walk with its own messages.
 * Settled by having those read through this and its twin, or by removing it.
 *
 * @param state - The game state
 * @returns The rear engagement, or `undefined`
 */
export function findRearEngagementStateFromMovement(state: GameState):
  | (EngagementState & {
      engagementResolutionState: RearEngagementResolutionState;
    })
  | undefined {
  // No Move order is being carried out, so no unit has walked into anyone.
  const movement = findMovementResolutionState(state);
  // 'pending' means this movement has not reached an engagement.
  if (movement === undefined || isPending(movement.engagementState)) {
    return undefined;
  }

  // The mover met the defender some other way: a front or a flank engagement.
  const resolution = movement.engagementState.engagementResolutionState;
  if (resolution.engagementType !== 'rear') {
    return undefined;
  }

  // `resolution` is a rear engagement. Rebuilding the parent carries that type.
  const rear = {
    ...movement.engagementState,
    engagementResolutionState: resolution,
  };

  // The rear engagement this movement opened.
  return rear;
}
