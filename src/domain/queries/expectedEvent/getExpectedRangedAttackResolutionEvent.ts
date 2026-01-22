import type {
  Board,
  ExpectedEventInfo,
  PlayerSide,
  RangedAttackResolutionState,
} from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';
import { getExpectedAttackApplyEvent } from './getExpectedAttackApplyEvent';

/**
 * Gets the expected event for ranged attack resolution substeps.
 *
 * @param resolutionState - The ranged attack resolution state
 * @param attackingPlayer - The player performing the attack
 * @returns Information about what event is expected
 */
export function getExpectedRangedAttackResolutionEvent<TBoard extends Board>(
  resolutionState: RangedAttackResolutionState<TBoard>,
  attackingPlayer: PlayerSide,
): ExpectedEventInfo<TBoard> {
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
    return getExpectedAttackApplyEvent(resolutionState.attackApplyState);
  }

  if (resolutionState.attackApplyState.completed) {
    return {
      actionType: 'gameEffect',
      effectType: 'completeRangedAttackCommand',
    };
  }

  throw new Error('Ranged attack resolution is in an invalid state');
}
