import type { AttackApplyState, RoutState } from '@game';
import { isOpenSubstep } from '../isOpenSubstep';

/**
 * Gets the rout state from an attack apply state.
 * Assumes the attack apply state has a rout state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The rout state
 * @throws Error if rout state is missing
 */
export function getRoutStateFromAttackApply(
  attackApplyState: AttackApplyState,
): RoutState {
  const routState = attackApplyState.routState;
  // Pending has not been written. Miss means this attack did not rout.
  if (!isOpenSubstep(routState)) {
    throw new Error('No rout state found in attack apply state');
  }
  return routState;
}
