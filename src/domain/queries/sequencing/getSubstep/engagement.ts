import type { Board } from "@entities";
import type {
  EngagementStateForBoard,
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  GameStateForBoard,
  RearEngagementResolutionState,
} from "@game";
import { getMovementResolutionState } from "../getCommandResolutionState";

/**
 * Gets the engagement state from a movement resolution.
 * Assumes we're resolving a movement with an engagement state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The engagement state
 * @throws Error if not resolving a movement or engagement state is missing
 */
export function getEngagementStateFromMovement<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
): EngagementStateForBoard<TBoard> {
  const movementState = getMovementResolutionState(state);
  if (!movementState.engagementState) {
    throw new Error("No engagement state found in movement resolution");
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
  state: GameStateForBoard<TBoard>,
): EngagementStateForBoard<TBoard> & {
  engagementResolutionState: FlankEngagementResolutionState;
} {
  const engagementState = getEngagementStateFromMovement(state);
  if (engagementState.engagementResolutionState.engagementType !== "flank") {
    throw new Error("Engagement type is not flank");
  }
  // Spread back into object for cleaner type inference
  const flankEngagementState = {
    ...engagementState,
    engagementResolutionState: engagementState.engagementResolutionState,
  };
  return flankEngagementState;
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
  state: GameStateForBoard<TBoard>,
): EngagementStateForBoard<TBoard> & {
  engagementResolutionState: FrontEngagementResolutionState;
} {
  const engagementState = getEngagementStateFromMovement(state);
  if (engagementState.engagementResolutionState.engagementType !== "front") {
    throw new Error("Engagement type is not front");
  }
  // Spread back into object for cleaner type inference
  const frontEngagementState = {
    ...engagementState,
    engagementResolutionState: engagementState.engagementResolutionState,
  };
  return frontEngagementState;
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
  state: GameStateForBoard<TBoard>,
): EngagementStateForBoard<TBoard> & {
  engagementResolutionState: RearEngagementResolutionState;
} {
  const engagementState = getEngagementStateFromMovement(state);
  if (engagementState.engagementResolutionState.engagementType !== "rear") {
    throw new Error("Engagement type is not rear");
  }
  // Spread back into object for cleaner type inference
  const rearEngagementState = {
    ...engagementState,
    engagementResolutionState: engagementState.engagementResolutionState,
  };
  return rearEngagementState;
}
