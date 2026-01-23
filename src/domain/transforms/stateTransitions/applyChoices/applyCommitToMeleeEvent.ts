import type { Board, GameState, ResolveMeleePhaseState } from '@entities';
import type { CommitToMeleeEvent } from '@events';
import { getMeleeResolutionState, getResolveMeleePhaseState } from '@queries';
import {
  discardCardsFromHand,
  updateCardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CommitToMeleeEvent to the game state.
 * Updates the player's commitment in the melee resolution state and discards the card.
 *
 * @param event - The commit to melee event to apply
 * @param state - The current game state
 * @returns A new game state with the commitment updated
 */
export function applyCommitToMeleeEvent<TBoard extends Board>(
  event: CommitToMeleeEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getResolveMeleePhaseState(state);
  const meleeState = getMeleeResolutionState(state);
  const player = event.player;

  // Get the player's commitment
  const playerCommitment =
    player === 'white'
      ? meleeState.whiteCommitment
      : meleeState.blackCommitment;

  if (playerCommitment.commitmentType !== 'pending') {
    throw new Error(`Player ${player} commitment is not pending`);
  }

  // Discard the card from hand
  const newCardState = discardCardsFromHand(state.cardState, player, [
    event.committedCard.id,
  ]);

  // Create completed commitment
  const newCommitment = {
    commitmentType: 'completed' as const,
    card: event.committedCard,
  };

  // Update melee resolution state with the new commitment
  const newMeleeState = {
    ...meleeState,
    ...(player === 'white'
      ? { whiteCommitment: newCommitment }
      : { blackCommitment: newCommitment }),
  };

  // Update phase state
  const newPhaseState: ResolveMeleePhaseState<TBoard> = {
    ...phaseState,
    currentMeleeResolutionState: newMeleeState,
  };

  const stateWithCards = updateCardState(state, newCardState);
  return updatePhaseState(stateWithCards, newPhaseState);
}
