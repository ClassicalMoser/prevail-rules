import type { AttackApplyState, RoutState } from '@game';
import { throwIfPending } from '@utils';

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
  const routState = throwIfPending(
    attackApplyState.routState,
    'No rout state found in attack apply state',
  );
  return routState;
}
