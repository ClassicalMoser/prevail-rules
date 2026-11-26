import type {
  EngagementState,
  FlankEngagementState,
  FrontEngagementState,
  GameState,
  RearEngagementState,
} from '@game';
import { getMovementResolutionState } from '../sequencing/commandResolution/getMovementResolutionState';
import { throwIfPending } from '@utils';

/**
 * Returns the engagement nested in the current movement.
 *
 * Throws when that command is not a movement, or when the movement has not
 * opened an engagement yet.
 */
export function getEngagementStateFromMovement(
  state: GameState,
): EngagementState {
  // The Move order being carried out; anything else is a fault in the caller.
  const movementState = getMovementResolutionState(state);

  // 'pending' means this movement has not reached an engagement.
  return throwIfPending(
    movementState.engagementState,
    'No engagement state found in movement resolution',
  );
}

/**
 * Front engagement on the current movement.
 * Throws when that engagement is flank or rear.
 */
export function getFrontEngagementStateFromMovement(
  state: GameState,
): FrontEngagementState {
  const engagementState = getEngagementStateFromMovement(state);

  // The caller is carrying out a front engagement; meeting a flank or rear
  // one instead is a fault in whatever sent it here.
  const resolution = engagementState.engagementResolutionState;
  if (resolution.engagementType !== 'front') {
    throw new Error('Engagement type is not front');
  }

  // `resolution` is a front engagement. Rebuilding the parent carries that type.
  return {
    ...engagementState,
    engagementResolutionState: resolution,
  };
}

/**
 * Flank engagement on the current movement.
 * Throws when that engagement is front or rear.
 */
export function getFlankEngagementStateFromMovement(
  state: GameState,
): FlankEngagementState {
  const engagementState = getEngagementStateFromMovement(state);

  // The caller is carrying out a flank engagement; meeting a front or rear
  // one instead is a fault in whatever sent it here.
  const resolution = engagementState.engagementResolutionState;
  if (resolution.engagementType !== 'flank') {
    throw new Error('Engagement type is not flank');
  }

  // `resolution` is a flank engagement. Rebuilding the parent carries that type.
  return {
    ...engagementState,
    engagementResolutionState: resolution,
  };
}

/**
 * Rear engagement on the current movement.
 * Throws when that engagement is front or flank.
 */
export function getRearEngagementStateFromMovement(
  state: GameState,
): RearEngagementState {
  const engagementState = getEngagementStateFromMovement(state);

  // The caller is carrying out a rear engagement; meeting a front or flank
  // one instead is a fault in whatever sent it here.
  const resolution = engagementState.engagementResolutionState;
  if (resolution.engagementType !== 'rear') {
    throw new Error('Engagement type is not rear');
  }

  // `resolution` is a rear engagement. Rebuilding the parent carries that type.
  return {
    ...engagementState,
    engagementResolutionState: resolution,
  };
}
