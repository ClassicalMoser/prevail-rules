import type {
  CommitToRangedAttackEvent,
  ProjectedCommitToRangedAttackEvent,
} from '@events';
import type { GameState, RangedAttackResolutionState } from '@game';
import { getRangedAttackResolutionState } from '@queries';
import { updateCommandResolutionState } from '@transforms/pureTransforms';

import {
  applyCommitCardDiscard,
  commitmentFromCommittedCard,
} from './commitApplyHelpers';

type CommitToRangedAttackApplyEvent =
  | CommitToRangedAttackEvent
  | ProjectedCommitToRangedAttackEvent;

/**
 * Applies a CommitToRangedAttackEvent to the game state.
 * Completes or declines the appropriate commitment (attacking or defending).
 * When `committedCard` is non-null, discards that card from hand.
 * Event is assumed pre-validated (issueCommands phase, ranged attack, player is
 * attacker or defender).
 *
 * Owned seats use full card identity. Unowned seats on seen views apply a
 * projected event (`committedCard: 'hidden'`).
 */
export function applyCommitToRangedAttackEvent<S extends GameState>(
  event: CommitToRangedAttackApplyEvent,
  state: S,
): S {
  const rangedAttackState = getRangedAttackResolutionState(state);
  const { player } = event;
  const attackingPlayer = rangedAttackState.attackingUnit.playerSide;
  const isAttackingPlayer = player === attackingPlayer;

  const stateWithCards = applyCommitCardDiscard(
    state,
    player,
    event.committedCard,
  );

  const newCommitment = commitmentFromCommittedCard(event.committedCard);
  const newRangedAttackState: RangedAttackResolutionState = {
    ...rangedAttackState,
    ...(isAttackingPlayer
      ? { attackingCommitment: newCommitment }
      : { defendingCommitment: newCommitment }),
  };

  return updateCommandResolutionState(stateWithCards, newRangedAttackState);
}
