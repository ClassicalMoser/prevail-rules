import type { AttackApplyState, ReverseState } from '@game';
import { isOpenSubstep } from '../isOpenSubstep';

/**
 * Gets the reverse state from an attack apply state.
 * Assumes the attack apply state has a reverse state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The reverse state
 * @throws Error if reverse state is missing
 */
export function getReverseStateFromAttackApply(
  attackApplyState: AttackApplyState,
): ReverseState {
  const reverseState = attackApplyState.reverseState;
  // Pending has not been written. Miss means this attack did not reverse.
  if (!isOpenSubstep(reverseState)) {
    throw new Error('No reverse state found in attack apply state');
  }
  return reverseState;
}
