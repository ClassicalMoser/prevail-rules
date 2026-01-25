import type {
  Board,
  ExpectedEventInfo,
  GameState,
  MeleeResolutionState,
} from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';
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
export function getExpectedMeleeResolutionEvent<TBoard extends Board>(
  gameState: GameState<TBoard>,
  meleeState: MeleeResolutionState<TBoard>,
): ExpectedEventInfo<TBoard> {
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
      playerSource: firstPlayer,
      choiceType: 'commitToMelee',
    };
  }

  // Check second player's commitment
  if (secondPlayerCommitment.commitmentType === 'pending') {
    return {
      actionType: 'playerChoice',
      playerSource: secondPlayer,
      choiceType: 'commitToMelee',
    };
  }

  // Both commitments resolved, check if resolveMelee has been applied
  // resolveMelee creates both attackApplyStates
  if (!firstPlayerAttackApplyState || !secondPlayerAttackApplyState) {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveMelee',
    };
  }

  // resolveMelee has been applied (both attackApplyStates exist)
  // Initiative player resolves their result first
  if (!firstPlayerAttackApplyState.completed) {
    return getExpectedAttackApplyEvent(firstPlayerAttackApplyState, gameState);
  }

  // First player's result resolved, check if second player's result needs resolution
  if (!secondPlayerAttackApplyState.completed) {
    return getExpectedAttackApplyEvent(secondPlayerAttackApplyState, gameState);
  }

  // Both attack apply states are complete, melee resolution should be complete
  return {
    actionType: 'gameEffect',
    effectType: 'completeMeleeResolution',
  };
}
