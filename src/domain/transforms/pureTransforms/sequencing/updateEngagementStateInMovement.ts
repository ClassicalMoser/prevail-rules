import type { Board } from "@entities";
import type { EngagementStateForBoard, GameStateForBoard } from "@game";
import { getMovementResolutionState } from "@queries";
import { updateCommandResolutionState } from "./updateCommandResolutionState";

/**
 * Updates the engagement state within the current movement resolution (issue commands phase).
 * Use when the command resolution type is movement and you have a new engagement state to set.
 *
 * @param state - The current game state
 * @param engagementState - The new engagement state to set
 * @returns A new game state with the updated engagement state
 */
export function updateEngagementStateInMovement<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  engagementState: EngagementStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const movementState = getMovementResolutionState(state);
  const newMovementState = {
    ...movementState,
    engagementState,
  };
  return updateCommandResolutionState(state, newMovementState);
}
