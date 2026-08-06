import type { CommitToRangedAttackEvent } from '@events';
import type {
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

/**
 * Applies a CommitToRangedAttackEvent to the game state.
 * Updates the appropriate commitment (attacking or defending) in the ranged attack
 * resolution state and discards the card.
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
  const newRangedAttackState: RangedAttackResolutionState = {
    ...rangedAttackState,
    ...(isAttackingPlayer
      ? { attackingCommitment: newCommitment }
      : { defendingCommitment: newCommitment }),
  };

  return updateCommandResolutionState(stateWithCards, newRangedAttackState);
}
