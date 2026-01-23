import type { AttackApplyState, Board, ReverseState } from '@entities';

/**
 * Gets the reverse state from an attack apply state.
 * Assumes the attack apply state has a reverse state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The reverse state
 * @throws Error if reverse state is missing
 */
export function getReverseStateFromAttackApply<TBoard extends Board>(
  attackApplyState: AttackApplyState<TBoard>,
): ReverseState<TBoard> {
  if (!attackApplyState.reverseState) {
    throw new Error('No reverse state found in attack apply state');
  }
  return attackApplyState.reverseState;
}
