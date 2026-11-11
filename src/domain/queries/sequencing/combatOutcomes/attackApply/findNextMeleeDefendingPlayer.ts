import type { PlayerSide } from '@entities';
import type { MeleeResolutionState } from '@game';
import { findNextMeleeAttackApplyToClose } from './findNextMeleeAttackApplyToClose';

/**
 * The player whose unit is defending in the next incomplete melee attack-apply
 * substep, in the order their results take effect (§7.5.6).
 *
 * Each apply carries its own defender, so this needs no game state and no
 * initiative lookup.
 *
 * @param meleeState - The melee resolution being sequenced
 * @returns `undefined` if either attack-apply state is missing, or both are
 * already complete
 */
export function findNextMeleeDefendingPlayer(
  meleeState: MeleeResolutionState,
): PlayerSide | undefined {
  // The apply to close next belongs to the unit that is defending in it.
  const next = findNextMeleeAttackApplyToClose(meleeState);
  return next?.defendingUnit.playerSide;
}
