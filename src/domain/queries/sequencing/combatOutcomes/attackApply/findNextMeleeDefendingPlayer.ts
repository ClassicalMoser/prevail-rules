import type { PlayerSide } from '@entities';
import type { MeleeResolutionState } from '@game';
import { getMeleeAppliesInResolutionOrder } from '@queries/sequencing/meleeResolution/getMeleeAppliesInResolutionOrder';

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
// TODO(composition): `getExpectedMeleeResolutionEvent` repeats this selection
// line for line, treating `'pending'` the same way; the `getNextMelee*`
// selectors are a third variant that skip per side and ignore `completed`.
// Settled by one "next open apply" selection for all of them.
export function findNextMeleeDefendingPlayer(
  meleeState: MeleeResolutionState,
): PlayerSide | undefined {
  // Resolution order only applies once both applies have been opened.
  const appliesInOrder = getMeleeAppliesInResolutionOrder(meleeState);
  if (appliesInOrder.length < 2) {
    return undefined;
  }

  // The first player's blow lands first, so the second player's unit is
  // closed out first (§7.5.6).
  const next = appliesInOrder.find((apply) => !apply.completed);
  return next?.defendingUnit.playerSide;
}
