import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  RangedAttackResolutionState,
} from '@entities';
import type { CommitToRangedAttackEvent } from '@events';
import {
  getIssueCommandsPhaseState,
  getOtherPlayer,
  getRangedAttackResolutionState,
} from '@queries';
import { discardCardsFromHand } from '@transforms/pureTransforms';

/**
 * Applies a CommitToRangedAttackEvent to the game state.
 * Updates the appropriate commitment (attacking or defending) in the ranged attack resolution state
 * and discards the card.
 *
 * @param event - The commit to ranged attack event to apply
 * @param state - The current game state
 * @returns A new game state with the commitment updated
 */
export function applyCommitToRangedAttackEvent<TBoard extends Board>(
  event: CommitToRangedAttackEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const rangedAttackState = getRangedAttackResolutionState(state);
  const player = event.player;

  // Determine if this is the attacking or defending player
  const attackingPlayer = rangedAttackState.attackingUnit.playerSide;
  const defendingPlayer = getOtherPlayer(attackingPlayer);

  // Determine which commitment to update
  const isAttackingPlayer = player === attackingPlayer;
  const isDefendingPlayer = player === defendingPlayer;

  if (!isAttackingPlayer && !isDefendingPlayer) {
    throw new Error('Player is not involved in this ranged attack');
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

  // Update ranged attack resolution state with the new commitment
  const newRangedAttackState: RangedAttackResolutionState<TBoard> = {
    ...rangedAttackState,
    ...(isAttackingPlayer
      ? { attackingCommitment: newCommitment }
      : { defendingCommitment: newCommitment }),
  };

  // Update phase state
  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...phaseState,
    currentCommandResolutionState: newRangedAttackState,
  };

  return {
    ...state,
    cardState: newCardState,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
