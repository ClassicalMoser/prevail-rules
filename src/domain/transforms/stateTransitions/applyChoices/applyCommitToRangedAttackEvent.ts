import type { CommitToRangedAttackEvent } from '@events';
import type {
  Commitment,
  GameState,
  OwnedPlayerForGameState,
  RangedAttackResolutionState,
} from '@game';
import {
  getOwnedPlayerCardState,
  getRangedAttackResolutionState,
} from '@queries';
import {
  discardCardsFromHand,
  updateCommandResolutionState,
  updatePlayerCardState,
} from '@transforms/pureTransforms';

function completedOrDeclinedCommitment(
  event: CommitToRangedAttackEvent,
): Commitment {
  if (event.committedCard === null) {
    return { commitmentType: 'declined' };
  }
  return {
    card: event.committedCard,
    commitmentType: 'completed',
  };
}

/**
 * Applies a CommitToRangedAttackEvent to the game state.
 * Completes or declines the appropriate commitment (attacking or defending).
 * When `committedCard` is non-null, discards that card from hand.
 * Event is assumed pre-validated (issueCommands phase, ranged attack, player is
 * attacker or defender).
 *
 * `event.player` must be owned under game state `S`.
 */
export function applyCommitToRangedAttackEvent<S extends GameState>(
  event: CommitToRangedAttackEvent & { player: OwnedPlayerForGameState<S> },
  state: S,
): S {
  const rangedAttackState = getRangedAttackResolutionState(state);
  const { player } = event;
  const attackingPlayer = rangedAttackState.attackingUnit.playerSide;
  const isAttackingPlayer = player === attackingPlayer;

  let stateWithCards = state;
  if (event.committedCard !== null) {
    const ownedPlayerCardState = getOwnedPlayerCardState(
      state.cardState,
      player,
    );
    const discardedCardState = discardCardsFromHand(ownedPlayerCardState, [
      event.committedCard.id,
    ]);
    stateWithCards = updatePlayerCardState(state, player, discardedCardState);
  }

  const newCommitment = completedOrDeclinedCommitment(event);
  const newRangedAttackState: RangedAttackResolutionState = {
    ...rangedAttackState,
    ...(isAttackingPlayer
      ? { attackingCommitment: newCommitment }
      : { defendingCommitment: newCommitment }),
  };

  return updateCommandResolutionState(stateWithCards, newRangedAttackState);
}
