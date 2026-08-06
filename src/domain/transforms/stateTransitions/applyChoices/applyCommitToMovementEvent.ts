import type { CommitToMovementEvent } from '@events';
import type { GameState, GameStateForVisibility, MovementResolutionState } from '@game';
import { getMovementResolutionState } from '@queries';
import {
  discardCardsFromHand,
  updateCommandResolutionState,
  updatePlayerCardState,
} from '@transforms/pureTransforms';

/**
 * Applies a CommitToMovementEvent to the game state.
 * Updates the commitment in the movement resolution state and discards the card.
 * Event is assumed pre-validated (issueCommands phase, movement resolution).
 *
 * Trusts authoritative visibility for owned card slices.
 */
export function applyCommitToMovementEvent(
  event: CommitToMovementEvent,
  state: GameState,
): GameState {
  const authoritative = state as GameStateForVisibility<'authoritative'>;
  const movementState = getMovementResolutionState(authoritative);
  const { player } = event;

  const stateWithCards = updatePlayerCardState(
    authoritative,
    player,
    discardCardsFromHand(authoritative.cardState[player], [
      event.committedCard.id,
    ]),
  );

  const newCommitment = {
    card: event.committedCard,
    commitmentType: 'completed' as const,
  };
  const newMovementState: MovementResolutionState = {
    ...movementState,
    commitment: newCommitment,
  };

  return updateCommandResolutionState(stateWithCards, newMovementState);
}
