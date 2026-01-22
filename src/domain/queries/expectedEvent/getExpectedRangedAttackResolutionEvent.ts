import type {
  Board,
  ExpectedEventInfo,
  PlayerSide,
  RangedAttackResolutionState,
} from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';

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
  // Both commitments resolved, check if performRangedAttack has been done
  // If attackApplyState exists, we're in the apply phase
  if (resolutionState.attackApplyState.substepType === 'attackApplyPending') {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveRangedAttack',
    };
  }
  // Attack apply in progress - check what needs to be resolved
  if (
    resolutionState.attackApplyState.substepType === 'attackApplyInProgress'
  ) {
    const applyState = resolutionState.attackApplyState;
    // TODO: Check which attack results need to be resolved (rout, retreat, reverse)
    // For now, if all are resolved, the command resolution should be complete
    if (
      applyState.routResolved &&
      applyState.retreatResolved &&
      applyState.reverseResolved
    ) {
      // Command resolution complete, should have been removed from remainingUnits
      throw new Error(
        'Ranged attack resolution complete but unit not removed from remainingUnits',
      );
    }
    // Some attack results still need resolution
    // TODO: Return appropriate resolve events (resolveRout, resolveRetreat, resolveReverse)
    throw new Error(
      'Attack apply in progress - resolve events not yet implemented',
    );
  }
  // Commitments resolved but performRangedAttack not yet done
  return {
    actionType: 'playerChoice',
    playerSource: attackingPlayer,
    choiceType: 'performRangedAttack',
  };
}
