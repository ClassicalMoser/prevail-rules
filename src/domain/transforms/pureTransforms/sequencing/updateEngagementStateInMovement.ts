import type { EngagementState, GameState } from '@game';
import { getMovementResolutionState } from '@queries';
import { updateCommandResolutionState } from './updateCommandResolutionState';

/**
 * Updates the engagement state within the current movement resolution (issue commands phase).
 * Use when the command resolution type is movement and you have a new engagement state to set.
 *
 * @param state - The current game state
 * @param engagementState - The new engagement state to set
 * @returns A new game state with the updated engagement state
 */
export function updateEngagementStateInMovement<S extends GameState>(
  state: S,
  engagementState: EngagementState,
): S {
  // Only a move can walk into an enemy (§6.1.1), so the engagement lives on
  // the move under way; during a shot, or outside Phase 3, this throws.
  const movementState = getMovementResolutionState(state);

  // The engagement is set up as the move resolves (§4.3.10), so the move
  // carries it until it is settled.
  const newMovementState = {
    ...movementState,
    engagementState,
  };
  const updated = updateCommandResolutionState(state, newMovementState);

  // The move, holding the engagement as it now stands.
  return updated;
}
