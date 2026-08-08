import type { CommitToMeleeEvent } from '@events';
import type { Commitment, GameState, OwnedPlayerForGameState } from '@game';
import { getMeleeResolutionState, getOwnedPlayerCardState } from '@queries';
import {
  discardCardsFromHand,
  updateMeleeResolutionState,
  updatePlayerCardState,
} from '@transforms/pureTransforms';

function completedOrDeclinedCommitment(event: CommitToMeleeEvent): Commitment {
  if (event.committedCard === null) {
    return { commitmentType: 'declined' };
  }
  return {
    card: event.committedCard,
    commitmentType: 'completed',
  };
}

/**
 * Applies a CommitToMeleeEvent to the game state.
 * Completes or declines the player's pending melee commitment.
 * When `committedCard` is non-null, discards that card from hand.
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

  let stateWithCards = state;
  if (event.committedCard !== null) {
    const ownedCardState = getOwnedPlayerCardState(state.cardState, player);
    const discardedCardState = discardCardsFromHand(ownedCardState, [
      event.committedCard.id,
    ]);
    stateWithCards = updatePlayerCardState(state, player, discardedCardState);
  }

  const newCommitment = completedOrDeclinedCommitment(event);
  const newMeleeState = {
    ...meleeState,
    ...(player === 'white'
      ? { whiteCommitment: newCommitment }
      : { blackCommitment: newCommitment }),
  };

  return updateMeleeResolutionState(stateWithCards, newMeleeState);
}
