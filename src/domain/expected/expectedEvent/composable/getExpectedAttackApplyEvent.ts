import type { ExpectedEventInfo } from '@events';
import type { AttackApplyState } from '@game';
import { attackApplyStages } from './attackApplyStages';
import { findExpectedAttackApplyStageEvent } from './findExpectedAttackApplyStageEvent';

/**
 * Gets the expected event for attack apply substeps.
 * This is a composable function that can be used in any context where
 * attack apply state appears (ranged attack resolution, melee resolution, etc.).
 *
 * An attack that reached no threshold (every outcome `'bypassed'`) is valid:
 * expect `completeAttackApply`.
 *
 * @param attackApplyState - The attack apply state
 * @returns Information about what event is expected
 */
export function getExpectedAttackApplyEvent(
  attackApplyState: AttackApplyState,
): ExpectedEventInfo {
  // The unit's results are carried out a stage at a time (§7.5.2); the
  // first stage with something due is what is expected next.
  for (const stage of attackApplyStages) {
    const due = findExpectedAttackApplyStageEvent(attackApplyState, stage);
    if (due !== undefined) {
      return due;
    }
  }

  // Every stage is done, or none was reached: close the apply. A miss is
  // common in melee and leaves only the empty shell to complete.
  if (attackApplyState.completed) {
    throw new Error('Attack apply state is already complete');
  }
  return {
    actionType: 'gameEffect',
    effectType: 'completeAttackApply',
  };
}
