import type { AttackApplyState, MeleeResolutionState } from '@game';

/**
 * The two units' attack applies in the order their results take effect.
 *
 * Both sides strike at once, but the first player's blow lands first
 * (§7.5.6), so it is the second player's unit that suffers each stage's result
 * first. The slots are named for whose unit holds the result — the first
 * player's apply holds the first player's unit — which makes the resolution
 * order the reverse of the slots'.
 *
 * Every walk of a melee's applies in resolution order reads it here, so that
 * order is written once.
 *
 * @param meleeState - The melee being resolved
 * @returns The second player's unit's apply, then the first player's; one not yet written is left out
 */
export function getMeleeAppliesInResolutionOrder(
  meleeState: MeleeResolutionState,
): AttackApplyState[] {
  const written = [
    meleeState.secondPlayerAttackApplyState,
    meleeState.firstPlayerAttackApplyState,
  ].filter((apply) => apply !== 'pending');
  return written;
}
