import type { CommitToMeleeEvent } from '@events';
import type { GameState, OwnedPlayerForGameState } from '@game';
import { getMeleeResolutionState, getOwnedPlayerCardState } from '@queries';
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
 * `event.player` must be owned under game state `S`.
 */
export function applyCommitToMeleeEvent<S extends GameState>(
  event: CommitToMeleeEvent & { player: OwnedPlayerForGameState<S> },
  state: S,
): S {
  const meleeState = getMeleeResolutionState(state);
  const { player } = event;

  const ownedCardState = getOwnedPlayerCardState(state.cardState, player);
  const discardedCardState = discardCardsFromHand(ownedCardState, [
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
  const newMeleeState = {
    ...meleeState,
    ...(player === 'white'
      ? { whiteCommitment: newCommitment }
      : { blackCommitment: newCommitment }),
  };

  return updateMeleeResolutionState(stateWithCards, newMeleeState);
}
