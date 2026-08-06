import type { CommitToMovementEvent } from '@events';
import type {
  GameState,
  MovementResolutionState,
  OwnedPlayerForGameState,
} from '@game';
import { getMovementResolutionState, getOwnedPlayerCardState } from '@queries';
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
 * `event.player` must be owned under game state `S`.
 */
export function applyCommitToMovementEvent<S extends GameState>(
  event: CommitToMovementEvent & { player: OwnedPlayerForGameState<S> },
  state: S,
): S {
  const movementState = getMovementResolutionState(state);
  const { player } = event;

  const ownedPlayerCardState = getOwnedPlayerCardState(state.cardState, player);
  const discardedCardState = discardCardsFromHand(ownedPlayerCardState, [
    event.committedCard.id,
  ]);
  const stateWithCards = updatePlayerCardState(
    state,
    player,
    discardedCardState,
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
