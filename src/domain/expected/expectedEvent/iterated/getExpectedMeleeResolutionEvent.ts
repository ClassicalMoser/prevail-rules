import type { ExpectedEventInfo } from '@events';
import type { GameState, MeleeResolutionState } from '@game';
import {
  getDefendingPlayerForNextIncompleteMeleeAttackApply,
  getOtherPlayer,
} from '@queries';
import { throwIfPending } from '@utils';
import { getExpectedAttackApplyEvent } from '../composable';

/**
 * Gets the expected event for melee resolution substeps.
 * This is a composable function that can be used in any context where
 * melee resolution state appears.
 *
 * @param gameState - The game state, needed to read what's happening on the board
 * @param meleeState - The melee resolution state
 * @returns Information about what event is expected
 */
export function getExpectedMeleeResolutionEvent(
  gameState: GameState,
  meleeState: MeleeResolutionState,
): ExpectedEventInfo {
  // Fast rejection: if already completed, this is an invalid state
  if (meleeState.completed) {
    throw new Error('Melee resolution state is already complete');
  }

  const firstPlayer = gameState.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  // Get commitments and attack apply states based on initiative order
  const firstPlayerCommitment = meleeState[`${firstPlayer}Commitment`];
  const secondPlayerCommitment = meleeState[`${secondPlayer}Commitment`];
  const firstPlayerAttackApplyState =
    meleeState[`${firstPlayer}AttackApplyState`];
  const secondPlayerAttackApplyState =
    meleeState[`${secondPlayer}AttackApplyState`];

  // Check first player's commitment
  if (firstPlayerCommitment.commitmentType === 'pending') {
    return {
      actionType: 'playerChoice',
      choiceType: 'commitToMelee',
      playerSource: firstPlayer,
    };
  }

  // Check second player's commitment
  if (secondPlayerCommitment.commitmentType === 'pending') {
    return {
      actionType: 'playerChoice',
      choiceType: 'commitToMelee',
      playerSource: secondPlayer,
    };
  }

  // Both commitments resolved, check if resolveMelee has been applied
  // ResolveMelee creates both attackApplyStates
  if (
    firstPlayerAttackApplyState === 'pending' ||
    secondPlayerAttackApplyState === 'pending'
  ) {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveMelee',
    };
  }

  // ResolveMelee has been applied (both attackApplyStates exist)
  const nextDefendingPlayer =
    getDefendingPlayerForNextIncompleteMeleeAttackApply(gameState, meleeState);
  if (nextDefendingPlayer !== null) {
    return getExpectedAttackApplyEvent(
      throwIfPending(
        meleeState[`${nextDefendingPlayer}AttackApplyState`],
        `No ${nextDefendingPlayer} attack apply state found in melee resolution`,
      ),
      gameState,
    );
  }

  // Both attack apply states are complete, melee resolution should be complete
  return {
    actionType: 'gameEffect',
    effectType: 'completeMeleeResolution',
  };
}
