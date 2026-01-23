import type {
  Board,
  EngagementState,
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  GameState,
  RearEngagementResolutionState,
} from '@entities';
import { getMovementResolutionState } from '../getCommandResolutionState';

/**
 * Gets the engagement state from a movement resolution.
 * Assumes we're resolving a movement with an engagement state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The engagement state
 * @throws Error if not resolving a movement or engagement state is missing
 */
export function getEngagementStateFromMovement<TBoard extends Board>(
  state: GameState<TBoard>,
): EngagementState<TBoard> {
  const movementState = getMovementResolutionState(state);
  if (!movementState.engagementState) {
    throw new Error('No engagement state found in movement resolution');
  }
  return movementState.engagementState;
}

/**
 * Gets the flank engagement state from a movement resolution.
 * Assumes we're resolving a movement with a flank engagement (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The engagement state with flank engagement resolution state
 * @throws Error if not resolving a movement, engagement state is missing, or engagement type is not flank
 */
export function getFlankEngagementStateFromMovement<TBoard extends Board>(
  state: GameState<TBoard>,
): EngagementState<TBoard> & {
  engagementResolutionState: FlankEngagementResolutionState;
} {
  const engagementState = getEngagementStateFromMovement(state);
  if (engagementState.engagementResolutionState.engagementType !== 'flank') {
    throw new Error('Engagement type is not flank');
  }
  return engagementState as EngagementState<TBoard> & {
    engagementResolutionState: FlankEngagementResolutionState;
  };
}

/**
 * Gets the front engagement state from a movement resolution.
 * Assumes we're resolving a movement with a front engagement (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The engagement state with front engagement resolution state
 * @throws Error if not resolving a movement, engagement state is missing, or engagement type is not front
 */
export function getFrontEngagementStateFromMovement<TBoard extends Board>(
  state: GameState<TBoard>,
): EngagementState<TBoard> & {
  engagementResolutionState: FrontEngagementResolutionState;
} {
  const engagementState = getEngagementStateFromMovement(state);
  if (engagementState.engagementResolutionState.engagementType !== 'front') {
    throw new Error('Engagement type is not front');
  }
  return engagementState as EngagementState<TBoard> & {
    engagementResolutionState: FrontEngagementResolutionState;
  };
}

/**
 * Gets the rear engagement state from a movement resolution.
 * Assumes we're resolving a movement with a rear engagement (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The engagement state with rear engagement resolution state
 * @throws Error if not resolving a movement, engagement state is missing, or engagement type is not rear
 */
export function getRearEngagementStateFromMovement<TBoard extends Board>(
  state: GameState<TBoard>,
): EngagementState<TBoard> & {
  engagementResolutionState: RearEngagementResolutionState;
} {
  const engagementState = getEngagementStateFromMovement(state);
  if (engagementState.engagementResolutionState.engagementType !== 'rear') {
    throw new Error('Engagement type is not rear');
  }
  return engagementState as EngagementState<TBoard> & {
    engagementResolutionState: RearEngagementResolutionState;
  };
}
