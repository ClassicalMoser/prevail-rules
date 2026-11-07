import type { ExpectedEventInfo } from '@events';
import type { GameState, MeleeResolutionState } from '@game';
import { getOtherPlayer } from '@queries';
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

  const { firstPlayerCommitment, secondPlayerCommitment } = meleeState;
  const { firstPlayerAttackApplyState, secondPlayerAttackApplyState } =
    meleeState;

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

  // Both applies exist, so they resolve in the order the slots are named in.
  if (!firstPlayerAttackApplyState.completed) {
    return getExpectedAttackApplyEvent(firstPlayerAttackApplyState);
  }
  if (!secondPlayerAttackApplyState.completed) {
    return getExpectedAttackApplyEvent(secondPlayerAttackApplyState);
  }

  // Both attack apply states are complete, melee resolution should be complete
  return {
    actionType: 'gameEffect',
    effectType: 'completeMeleeResolution',
  };
}
