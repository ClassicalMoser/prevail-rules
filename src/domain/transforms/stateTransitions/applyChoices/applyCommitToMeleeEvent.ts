import type { Board } from '@entities';
import type { CommitToMeleeEvent } from '@events';
import type { GameStateForBoard } from '@game';
import { getMeleeResolutionState } from '@queries';
import {
  discardCardsFromHand,
  updateMeleeResolutionState,
  updatePlayerCardState,
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
  event: CommitToMeleeEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const meleeState = getMeleeResolutionState(state);
  const { player } = event;

  // Discard committed card from player's hand
  const stateWithCards = updatePlayerCardState(
    state,
    player,
    discardCardsFromHand(state.cardState[player], [event.committedCard.id]),
  );

  // Mark this player's commitment as completed with the chosen card
  const newCommitment = {
    card: event.committedCard,
    commitmentType: 'completed' as const,
  };
  const newMeleeState = {
    ...meleeState,
    ...(player === 'white'
      ? { whiteCommitment: newCommitment }
      : { blackCommitment: newCommitment }),
  };

  const newGameState = updateMeleeResolutionState(
    stateWithCards,
    newMeleeState,
  );
  return newGameState;
}
