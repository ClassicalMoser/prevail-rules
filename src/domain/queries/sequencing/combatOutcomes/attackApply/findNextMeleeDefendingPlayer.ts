import type { PlayerSide } from '@entities';
import type { MeleeResolutionState } from '@game';

/**
 * The player whose unit is defending in the next incomplete melee attack-apply
 * substep, in the order the slots are named in.
 *
 * The slots carry the order and each apply carries its own defender, so this
 * needs no game state and no initiative lookup.
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
  const { firstPlayerAttackApplyState, secondPlayerAttackApplyState } =
    meleeState;

  // Initiative order only applies once both applies have been opened.
  if (
    firstPlayerAttackApplyState === 'pending' ||
    secondPlayerAttackApplyState === 'pending'
  ) {
    return undefined;
  }

  if (!firstPlayerAttackApplyState.completed) {
    return firstPlayerAttackApplyState.defendingUnit.playerSide;
  }

  if (!secondPlayerAttackApplyState.completed) {
    return secondPlayerAttackApplyState.defendingUnit.playerSide;
  }

  // Both applies are finished.
  return undefined;
}
