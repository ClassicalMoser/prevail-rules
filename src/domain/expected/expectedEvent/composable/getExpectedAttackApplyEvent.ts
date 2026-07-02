import type { ExpectedEventInfo } from '@events';
import type { AttackApplyState, GameState } from '@game';
import { canReverseUnit } from '@queries';
import { getExpectedRetreatEvent } from './getExpectedRetreatEvent';
import { getExpectedReverseEvent } from './getExpectedReverseEvent';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * Gets the expected event for attack apply substeps.
 * This is a composable function that can be used in any context where
 * attack apply state appears (ranged attack resolution, melee resolution, etc.).
 *
 * @param attackApplyState - The attack apply state
 * @param gameState - The game state, needed for melee reverse engagement checks
 * @returns Information about what event is expected
 */
export function getExpectedAttackApplyEvent(
  attackApplyState: AttackApplyState,
  gameState: GameState,
): ExpectedEventInfo {
  const { attackResult } = attackApplyState;

  // Check if there are any results
  const hasResults =
    attackResult.unitRouted ||
    attackResult.unitRetreated ||
    attackResult.unitReversed;

  // If no results reported, state was not initialized correctly
  if (
    !hasResults ||
    (attackApplyState.retreatState === 'pending' &&
      attackApplyState.reverseState === 'pending' &&
      attackApplyState.routState === 'pending')
  ) {
    throw new Error('Attack apply state not initialized correctly');
  }

  // Results reported, check which need resolution
  // Priority: rout > retreat > reverse (rout is most severe)
  if (attackResult.unitRouted && attackApplyState.routState !== 'pending') {
    if (!attackApplyState.routState.completed) {
      return getExpectedRoutEvent(attackApplyState.routState);
    }
    // If unit was routed, no further resolution is needed
    if (!attackApplyState.completed) {
      return {
        actionType: 'gameEffect',
        effectType: 'completeAttackApply',
      };
    }
    throw new Error('Attack apply state is already complete');
  }

  if (
    attackResult.unitRetreated &&
    attackApplyState.retreatState !== 'pending' &&
    !attackApplyState.retreatState.completed
  ) {
    return getExpectedRetreatEvent(attackApplyState.retreatState);
  }

  if (
    attackResult.unitReversed &&
    attackApplyState.reverseState !== 'pending' &&
    !attackApplyState.reverseState.completed
  ) {
    // In melee, if units are still engaged, reverse cannot happen
    if (!canReverseUnit(attackApplyState.reverseState, gameState)) {
      // Units are still engaged - reverse cannot happen, skip to completeAttackApply
      if (attackApplyState.completed) {
        throw new Error('Attack apply state is already complete');
      }
      return {
        actionType: 'gameEffect',
        effectType: 'completeAttackApply',
      };
    }
    return getExpectedReverseEvent(attackApplyState.reverseState);
    // Reverse is complete, continue to check if attack apply is complete
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
