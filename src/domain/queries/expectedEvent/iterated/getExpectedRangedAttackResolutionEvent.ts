import type {
  Board,
  ExpectedEventInfo,
  GameState,
  PlayerSide,
  RangedAttackResolutionState,
} from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';
import { getExpectedAttackApplyEvent } from '../composable';

/**
 * Gets the expected event for ranged attack resolution substeps.
 *
 * @param gameState - The game state
 * @param resolutionState - The ranged attack resolution state
 * @param attackingPlayer - The player performing the attack
 * @returns Information about what event is expected
 */
export function getExpectedRangedAttackResolutionEvent<TBoard extends Board>(
  gameState: GameState<TBoard>,
  resolutionState: RangedAttackResolutionState<TBoard>,
  attackingPlayer: PlayerSide,
): ExpectedEventInfo<TBoard> {
  // Fast rejection: if already completed, this is an invalid state
  if (resolutionState.completed) {
    throw new Error('Ranged attack resolution state is already complete');
  }

  const defendingPlayer = getOtherPlayer(attackingPlayer);

  // Check attacking player's commitment
  if (resolutionState.attackingCommitment.commitmentType === 'pending') {
    return {
      actionType: 'playerChoice',
      playerSource: attackingPlayer,
      choiceType: 'commitToRangedAttack',
    };
  }

  // Check defending player's commitment
  if (resolutionState.defendingCommitment.commitmentType === 'pending') {
    return {
      actionType: 'playerChoice',
      playerSource: defendingPlayer,
      choiceType: 'commitToRangedAttack',
    };
  }

  // Both commitments resolved, check if resolveRangedAttack has been applied
  // resolveRangedAttack calculates the attack and creates attackApplyState
  if (!resolutionState.attackApplyState) {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveRangedAttack',
    };
  }

  if (!resolutionState.attackApplyState.completed) {
    // resolveRangedAttack has been applied (attackApplyState exists)
    // Use composable function to determine next expected event
    return getExpectedAttackApplyEvent(
      resolutionState.attackApplyState,
      gameState,
    );
  }

  // Attack apply state is complete, ranged attack resolution should be complete
  return {
    actionType: 'gameEffect',
    effectType: 'completeRangedAttackCommand',
  };
}
