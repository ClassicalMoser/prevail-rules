import type { Board } from '@entities';
import type { ChooseRetreatOptionEvent } from '@events';
import type { GameStateForBoard, RetreatState } from '@game';
import { findRetreatState } from '@queries';
import { updateRetreatState } from '@transforms/pureTransforms';

/**
 * Applies a ChooseRetreatOptionEvent to the game state.
 * Updates the finalPosition in the retreat state.
 *
 * Retreat state can be found in:
 * - AttackApplyState (in ranged attack resolution or melee resolution)
 * - EngagementState (in movement resolution, for front engagements) - TODO: Not yet implemented
 *
 * Event is assumed pre-validated (correct phase and player has an active retreat).
 *
 * @param event - The choose retreat option event to apply
 * @param state - The current game state
 * @returns A new game state with the retreat option chosen
 */
export function applyChooseRetreatOptionEvent<TBoard extends Board>(
  event: ChooseRetreatOptionEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  // Finds the retreat state for the player, regardless of the phase
  const retreatState = findRetreatState(state, event.player);
  // Updates the retreat state with the new final position
  const newRetreatState: RetreatState = {
    ...retreatState,
    finalPosition: event.retreatOption,
  };
  // Return the new game state with the updated retreat state
  const newGameState = updateRetreatState(state, newRetreatState);
  return newGameState;
}
