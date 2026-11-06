import type { AttackApplyState, RetreatState } from '@game';
import { isOpenSubstep } from '../isOpenSubstep';

/**
 * Gets the retreat state from an attack apply state.
 * Assumes the attack apply state has a retreat state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The retreat state
 * @throws Error if retreat state is missing
 */
export function getRetreatStateFromAttackApply(
  attackApplyState: AttackApplyState,
): RetreatState {
  const retreatState = attackApplyState.retreatState;
  // Pending has not been written. Miss means this attack did not retreat.
  if (!isOpenSubstep(retreatState)) {
    throw new Error('No retreat state found in attack apply state');
  }
  return retreatState;
}
