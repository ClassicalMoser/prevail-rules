import type {
  EngagementState,
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  GameState,
  RearEngagementResolutionState,
} from '@game';
import { getMovementResolutionState } from '../sequencing/commandResolution/getCommandResolutionState';
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
  const movementState = getMovementResolutionState(state);
  // 'pending' means this movement has not reached an engagement.
  return throwIfPending(
    movementState.engagementState,
    'No engagement state found in movement resolution',
  );
}

/**
 * `EngagementState` carries every resolution type. The type below names the one
 * member this getter proved, because the discriminant sits on the nested
 * `engagementResolutionState`.
 */
type FrontEngagementState = EngagementState & {
  engagementResolutionState: FrontEngagementResolutionState;
};
type FlankEngagementState = EngagementState & {
  engagementResolutionState: FlankEngagementResolutionState;
};
type RearEngagementState = EngagementState & {
  engagementResolutionState: RearEngagementResolutionState;
};

/**
 * Front engagement on the current movement.
 * Throws when that engagement is flank or rear.
 */
export function getFrontEngagementStateFromMovement(
  state: GameState,
): FrontEngagementState {
  const engagementState = getEngagementStateFromMovement(state);
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
