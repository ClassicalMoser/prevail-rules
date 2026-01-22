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

  // Both commitments resolved, check if resolveRangedAttack has been applied
  // resolveRangedAttack calculates the attack and sets attackResult
  const applyState = resolutionState.attackApplyState;
  const attackResult = applyState.attackResult;

  // Check if resolveRangedAttack has been applied
  // If attackResult is all false and no states exist, resolveRangedAttack hasn't been applied yet
  // If attackResult has results OR states exist, resolveRangedAttack has been applied
  const hasResults =
    attackResult.unitRouted ||
    attackResult.unitRetreated ||
    attackResult.unitReversed;
  const hasStates =
    applyState.routState !== undefined ||
    applyState.retreatState !== undefined ||
    applyState.reverseState !== undefined;

  // If no results and no states, resolveRangedAttack hasn't been applied yet
  if (!hasResults && !hasStates) {
    return {
      actionType: 'gameEffect',
      effectType: 'resolveRangedAttack',
    };
  }

  // resolveRangedAttack has been applied
  // If no results occurred, attack had no effect - command resolution complete
  if (!hasResults) {
    throw new Error(
      'Ranged attack resolution complete but unit not removed from remainingUnits',
    );
  }

  // Results occurred, check which need resolution
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
