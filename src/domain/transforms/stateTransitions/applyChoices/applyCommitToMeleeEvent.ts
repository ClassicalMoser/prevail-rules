import type { CommitToMeleeEvent } from '@events';
import type { GameState, GameStateForVisibility } from '@game';
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
 * Trusts authoritative visibility for owned card slices.
 */
export function applyCommitToMeleeEvent(
  event: CommitToMeleeEvent,
  state: GameState,
): GameState {
  const authoritative = state as GameStateForVisibility<'authoritative'>;
  const meleeState = getMeleeResolutionState(authoritative);
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
  const newMeleeState = {
    ...meleeState,
    ...(player === 'white'
      ? { whiteCommitment: newCommitment }
      : { blackCommitment: newCommitment }),
  };

  return updateMeleeResolutionState(stateWithCards, newMeleeState);
}
