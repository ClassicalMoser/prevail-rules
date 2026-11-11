import type { AttackApplyState, MeleeResolutionState } from '@game';

/**
 * The melee attack apply still to close, in the order the blows take effect.
 *
 * @param _meleeState - The melee being sequenced.
 * @returns The apply, if any.
 */
export function findNextMeleeAttackApplyToClose(
  _meleeState: MeleeResolutionState,
): AttackApplyState | undefined {
  return undefined;
}
