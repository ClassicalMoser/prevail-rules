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
