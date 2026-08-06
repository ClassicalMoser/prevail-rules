import type { CommitToRangedAttackEvent } from '@events';
import type {
  GameState,
  GameStateForVisibility,
  RangedAttackResolutionState,
} from '@game';
import { getRangedAttackResolutionState } from '@queries';
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
 * Trusts authoritative visibility for owned card slices.
 */
export function applyCommitToRangedAttackEvent(
  event: CommitToRangedAttackEvent,
  state: GameState,
): GameState {
  const authoritative = state as GameStateForVisibility<'authoritative'>;
  const rangedAttackState = getRangedAttackResolutionState(authoritative);
  const { player } = event;
  const attackingPlayer = rangedAttackState.attackingUnit.playerSide;
  const isAttackingPlayer = player === attackingPlayer;

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
  const newRangedAttackState: RangedAttackResolutionState = {
    ...rangedAttackState,
    ...(isAttackingPlayer
      ? { attackingCommitment: newCommitment }
      : { defendingCommitment: newCommitment }),
  };

  return updateCommandResolutionState(stateWithCards, newRangedAttackState);
}
