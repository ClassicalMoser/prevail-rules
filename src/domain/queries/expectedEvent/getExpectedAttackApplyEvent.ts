import type { AttackApplyState, Board, ExpectedEventInfo } from '@entities';
import { getExpectedRetreatEvent } from './getExpectedRetreatEvent';
import { getExpectedReverseEvent } from './getExpectedReverseEvent';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * Gets the expected event for attack apply substeps.
 * This is a composable function that can be used in any context where
 * attack apply state appears (ranged attack resolution, melee resolution, etc.).
 *
 * @param attackApplyState - The attack apply state
 * @returns Information about what event is expected
 */
export function getExpectedAttackApplyEvent<TBoard extends Board>(
  attackApplyState: AttackApplyState<TBoard>,
): ExpectedEventInfo<TBoard> {
  const attackResult = attackApplyState.attackResult;

  // Check if there are any results
  const hasResults =
    attackResult.unitRouted ||
    attackResult.unitRetreated ||
    attackResult.unitReversed;

  // If no results occurred, attack had no effect - command resolution complete
  if (!hasResults) {
    throw new Error('Attack apply state not initialized');
  }

  // Results occurred, check which need resolution
  // Priority: rout > retreat > reverse (rout is most severe)
  if (attackResult.unitRouted && attackApplyState.routState) {
    return getExpectedRoutEvent(attackApplyState.routState);
  }

  if (attackResult.unitRetreated && attackApplyState.retreatState) {
    return getExpectedRetreatEvent(attackApplyState.retreatState);
  }

  if (attackResult.unitReversed && attackApplyState.reverseState) {
    return getExpectedReverseEvent(attackApplyState.reverseState);
  }

  if (!attackApplyState.completed) {
    return {
      actionType: 'gameEffect',
      effectType: 'completeAttackApply',
    };
  }

  // All attack results resolved, command resolution should be complete
  throw new Error('Attack apply state is already complete');
}
