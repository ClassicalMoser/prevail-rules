import type { Board } from "@entities";
import type { CommitToMovementEvent } from "@events";
import type { GameStateForBoard, MovementResolutionStateForBoard } from "@game";
import { getMovementResolutionState } from "@queries";
import {
  discardCardsFromHand,
  updateCardState,
  updateCommandResolutionState,
} from "@transforms/pureTransforms";

/**
 * Applies a CommitToMovementEvent to the game state.
 * Updates the commitment in the movement resolution state and discards the card.
 * Event is assumed pre-validated (issueCommands phase, movement resolution).
 *
 * @param event - The commit to movement event to apply
 * @param state - The current game state
 * @returns A new game state with the commitment updated
 */
export function applyCommitToMovementEvent<TBoard extends Board>(
  event: CommitToMovementEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const movementState = getMovementResolutionState(state);
  const player = event.player;

  // Discard committed card from player's hand
  const newCardState = discardCardsFromHand(state.cardState, player, [event.committedCard.id]);

  // Mark movement commitment as completed with the chosen card
  const newCommitment = {
    commitmentType: "completed" as const,
    card: event.committedCard,
  };
  const newMovementState: MovementResolutionStateForBoard<TBoard> = {
    ...movementState,
    commitment: newCommitment,
  };

  const stateWithCards = updateCardState(state, newCardState);
  const newGameState = updateCommandResolutionState(stateWithCards, newMovementState);
  return newGameState;
}
