import type {
  Board,
  ExpectedEventInfo,
  PlayerSide,
  RangedAttackResolutionState,
} from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';
import { getExpectedRetreatEvent } from './getExpectedRetreatEvent';
import { getExpectedReverseEvent } from './getExpectedReverseEvent';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

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

  // Both commitments resolved, check attack apply state progression
  const applyState = resolutionState.attackApplyState;
  const attackResult = applyState.attackResult;

  // Check if any attack results occurred (performRangedAttack has been done)
  const hasResults =
    attackResult.unitRouted ||
    attackResult.unitRetreated ||
    attackResult.unitReversed;

  // If no results occurred, check if performRangedAttack has been done
  // If attackResult is all false and no states exist, we might need performRangedAttack
  // But if we're here, performRangedAttack should have been done (even if no results)
  // So if no results, command resolution should be complete
  if (!hasResults) {
    // No results means attack had no effect, command resolution complete
    throw new Error(
      'Ranged attack resolution complete but unit not removed from remainingUnits',
    );
  }

  // Results occurred, check if resolveRangedAttack has been applied
  // States exist if resolveRangedAttack has created them for results that occurred
  const routNeedsState = attackResult.unitRouted && !applyState.routState;
  const retreatNeedsState =
    attackResult.unitRetreated && !applyState.retreatState;
  const reverseNeedsState =
    attackResult.unitReversed && !applyState.reverseState;

  // If any result occurred but state doesn't exist, need resolveRangedAttack
  if (routNeedsState || retreatNeedsState || reverseNeedsState) {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveRangedAttack',
    };
  }

  // resolveRangedAttack has been applied, check which results need resolution
  // Priority: rout > retreat > reverse (rout is most severe)
  if (attackResult.unitRouted && applyState.routState) {
    return getExpectedRoutEvent(applyState.routState);
  }

  if (attackResult.unitRetreated && applyState.retreatState) {
    return getExpectedRetreatEvent(applyState.retreatState);
  }

  if (attackResult.unitReversed && applyState.reverseState) {
    return getExpectedReverseEvent(applyState.reverseState);
  }

  // All attack results resolved, command resolution should be complete
  throw new Error(
    'Ranged attack resolution complete but unit not removed from remainingUnits',
  );
}
