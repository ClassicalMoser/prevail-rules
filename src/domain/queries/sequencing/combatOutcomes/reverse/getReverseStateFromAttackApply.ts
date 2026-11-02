import type { AttackApplyState, ReverseState } from '@game';
import { throwIfPending } from '@utils';

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
  const reverseState = throwIfPending(
    attackApplyState.reverseState,
    'No reverse state found in attack apply state',
  );
  return reverseState;
}
