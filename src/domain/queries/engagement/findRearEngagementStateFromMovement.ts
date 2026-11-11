import type {
  EngagementState,
  GameState,
  RearEngagementResolutionState,
} from '@game';
import { findMovementResolutionState } from '../sequencing/commandResolution/findMovementResolutionState';

/**
 * The rear engagement on the movement being carried out (§6.3.3), or
 * `undefined` when the movement has opened no engagement or opened a front or
 * a flank one. `getRearEngagementStateFromMovement` is the twin that insists.
 *
 * @param state - The game state
 * @returns The rear engagement, or `undefined`
 */
export function findRearEngagementStateFromMovement(state: GameState):
  | (EngagementState & {
      engagementResolutionState: RearEngagementResolutionState;
    })
  | undefined {
  const movement = findMovementResolutionState(state);
  // 'pending' means this movement has not reached an engagement.
  if (movement === undefined || movement.engagementState === 'pending') {
    return undefined;
  }
  const resolution = movement.engagementState.engagementResolutionState;
  if (resolution.engagementType !== 'rear') {
    return undefined;
  }
  // `resolution` is a rear engagement. Rebuilding the parent carries that type.
  const rear = {
    ...movement.engagementState,
    engagementResolutionState: resolution,
  };
  return rear;
}
