import type { Board } from '@entities';
import type {
  EngagementState,
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  GameStateWithBoard,
  RearEngagementResolutionState,
} from '@game';
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
  state: GameStateWithBoard<TBoard>,
): EngagementState {
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
  state: GameStateWithBoard<TBoard>,
): EngagementState & {
  engagementResolutionState: FlankEngagementResolutionState;
} {
  const engagementState = getEngagementStateFromMovement(state);
  if (engagementState.engagementResolutionState.engagementType !== 'flank') {
    throw new Error('Engagement type is not flank');
  }
  return engagementState as EngagementState & {
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
  state: GameStateWithBoard<TBoard>,
): EngagementState & {
  engagementResolutionState: FrontEngagementResolutionState;
} {
  const engagementState = getEngagementStateFromMovement(state);
  if (engagementState.engagementResolutionState.engagementType !== 'front') {
    throw new Error('Engagement type is not front');
  }
  return engagementState as EngagementState & {
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
  state: GameStateWithBoard<TBoard>,
): EngagementState & {
  engagementResolutionState: RearEngagementResolutionState;
} {
  const engagementState = getEngagementStateFromMovement(state);
  if (engagementState.engagementResolutionState.engagementType !== 'rear') {
    throw new Error('Engagement type is not rear');
  }
  return engagementState as EngagementState & {
    engagementResolutionState: RearEngagementResolutionState;
  };
}
