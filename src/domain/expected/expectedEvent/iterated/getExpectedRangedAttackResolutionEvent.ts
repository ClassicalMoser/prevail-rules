import type { PlayerSide } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { GameState, RangedAttackResolutionState } from '@game';
import { getOtherPlayer } from '@queries';
import { getExpectedAttackApplyEvent } from '../composable';

/**
 * Gets the expected event for ranged attack resolution substeps.
 *
 * @param gameState - The game state
 * @param resolutionState - The ranged attack resolution state
 * @param attackingPlayer - The player performing the attack
 * @returns Information about what event is expected
 */
export function getExpectedRangedAttackResolutionEvent(
  gameState: GameState,
  resolutionState: RangedAttackResolutionState,
  attackingPlayer: PlayerSide,
): ExpectedEventInfo {
  // Fast rejection: if already completed, this is an invalid state
  if (resolutionState.completed) {
    throw new Error('Ranged attack resolution state is already complete');
  }

  const defendingPlayer = getOtherPlayer(attackingPlayer);

  // The shooter commits first, before it aims: a Range card reaches one
  // space further, so it must already be committed when the target is
  // chosen (§4.3.11 step 2, §7.4.5).
  if (resolutionState.attackingCommitment.commitmentType === 'pending') {
    return {
      actionType: 'playerChoice',
      choiceType: 'commitToRangedAttack',
      playerSource: attackingPlayer,
    };
  }

  // With the card committed or refused, the shooter names its target and any
  // supporters (§4.3.11 steps 3–4).
  if (resolutionState.defendingUnit === 'pending') {
    return {
      actionType: 'playerChoice',
      choiceType: 'performRangedAttack',
      playerSource: attackingPlayer,
    };
  }

  // Then the target's owner, knowing what it faces, may commit for Defence
  // or Flexibility (§4.3.11 step 5).
  if (resolutionState.defendingCommitment.commitmentType === 'pending') {
    return {
      actionType: 'playerChoice',
      choiceType: 'commitToRangedDefense',
      playerSource: defendingPlayer,
    };
  }

  // Both commitments resolved, check if resolveRangedAttack has been applied
  // ResolveRangedAttack calculates the attack and creates attackApplyState
  if (resolutionState.attackApplyState === 'pending') {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveRangedAttack',
    };
  }

  if (!resolutionState.attackApplyState.completed) {
    // ResolveRangedAttack has been applied (attackApplyState exists)
    // Use composable function to determine next expected event
    return getExpectedAttackApplyEvent(resolutionState.attackApplyState);
  }

  // The shot's result is settled: this shot is done, and the next shooter is
  // chosen from those still to act (§4.3.11).
  return {
    actionType: 'gameEffect',
    effectType: 'completeRangedAttack',
  };
}
