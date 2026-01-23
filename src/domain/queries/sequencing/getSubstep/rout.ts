import type { AttackApplyState, Board, RoutState } from '@entities';

/**
 * Gets the rout state from an attack apply state.
 * Assumes the attack apply state has a rout state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The rout state
 * @throws Error if rout state is missing
 */
export function getRoutStateFromAttackApply<TBoard extends Board>(
  attackApplyState: AttackApplyState<TBoard>,
): RoutState {
  if (!attackApplyState.routState) {
    throw new Error('No rout state found in attack apply state');
  }
  return attackApplyState.routState;
}
