import type {
  EngagementState,
  FrontEngagementResolutionState,
  GameState,
} from '@game';
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
export function findFrontEngagementStateFromMovement(state: GameState):
  | (EngagementState & {
      engagementResolutionState: FrontEngagementResolutionState;
    })
  | undefined {
  const movement = findMovementResolutionState(state);
  // 'pending' means this movement has not reached an engagement.
  if (movement === undefined || movement.engagementState === 'pending') {
    return undefined;
  }
  const resolution = movement.engagementState.engagementResolutionState;
  if (resolution.engagementType !== 'front') {
    return undefined;
  }
  // `resolution` is a front engagement. Rebuilding the parent carries that type.
  const front = {
    ...movement.engagementState,
    engagementResolutionState: resolution,
  };
  return front;
}
