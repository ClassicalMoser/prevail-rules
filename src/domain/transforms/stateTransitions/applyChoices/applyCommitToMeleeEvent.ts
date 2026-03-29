import type { Board } from '@entities';
import type { CommitToMeleeEvent } from '@events';
import type { GameState } from '@game';
import { getMeleeResolutionState } from '@queries';
import {
  discardCardsFromHand,
  updateCardState,
  updateMeleeResolutionState,
} from '@transforms/pureTransforms';

/**
 * Applies a CommitToMeleeEvent to the game state.
 * Updates the player's commitment in the melee resolution state and discards the card.
 * Event is assumed pre-validated (resolveMelee phase, player's commitment pending).
 *
 * @param event - The commit to melee event to apply
 * @param state - The current game state
 * @returns A new game state with the commitment updated
 */
export function applyCommitToMeleeEvent<TBoard extends Board>(
  event: CommitToMeleeEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const meleeState = getMeleeResolutionState(state);
  const player = event.player;

  // Discard committed card from player's hand
  const newCardState = discardCardsFromHand(state.cardState, player, [
    event.committedCard.id,
  ]);

  // Mark this player's commitment as completed with the chosen card
  const newCommitment = {
    commitmentType: 'completed' as const,
    card: event.committedCard,
  };
  const newMeleeState = {
    ...meleeState,
    ...(player === 'white'
      ? { whiteCommitment: newCommitment }
      : { blackCommitment: newCommitment }),
  };

  const stateWithCards = updateCardState(state, newCardState);
  const newGameState = updateMeleeResolutionState(
    stateWithCards,
    newMeleeState,
  );
  return newGameState;
}
