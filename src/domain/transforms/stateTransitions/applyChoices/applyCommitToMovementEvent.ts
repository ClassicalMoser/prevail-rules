import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  MovementResolutionState,
} from '@entities';
import type { CommitToMovementEvent } from '@events';
import {
  getIssueCommandsPhaseState,
  getMovementResolutionState,
} from '@queries';
import {
  discardCardsFromHand,
  updateCardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CommitToMovementEvent to the game state.
 * Updates the commitment in the movement resolution state and discards the card.
 *
 * @param event - The commit to movement event to apply
 * @param state - The current game state
 * @returns A new game state with the commitment updated
 */
export function applyCommitToMovementEvent<TBoard extends Board>(
  event: CommitToMovementEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const movementState = getMovementResolutionState(state);
  const player = event.player;

  // Discard the card from hand
  const newCardState = discardCardsFromHand(state.cardState, player, [
    event.committedCard.id,
  ]);

  // Create completed commitment
  const newCommitment = {
    commitmentType: 'completed' as const,
    card: event.committedCard,
  };

  // Update movement resolution state with the new commitment
  const newMovementState: MovementResolutionState<TBoard> = {
    ...movementState,
    commitment: newCommitment,
  };

  // Update phase state
  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...phaseState,
    currentCommandResolutionState: newMovementState,
  };

  const stateWithCards = updateCardState(state, newCardState);
  return updatePhaseState(stateWithCards, newPhaseState);
}
