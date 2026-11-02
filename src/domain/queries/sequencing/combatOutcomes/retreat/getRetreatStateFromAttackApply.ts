import type { AttackApplyState, RetreatState } from '@game';
import { throwIfPending } from '@utils';

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
  const retreatState = throwIfPending(
    attackApplyState.retreatState,
    'No retreat state found in attack apply state',
  );
  return retreatState;
}
