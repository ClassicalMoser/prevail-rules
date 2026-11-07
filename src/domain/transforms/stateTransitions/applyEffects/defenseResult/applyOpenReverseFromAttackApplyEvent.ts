import type { OpenReverseFromAttackApplyEvent } from '@events';
import type { GameState, ReverseState } from '@game';
import { RANGED_ATTACK_RESOLUTION_CONTEXT } from '@events';
import { getMeleeAttackApplyState, getRangedAttackApplyState } from '@queries';
import { updateAttackApplyState } from '@transforms/pureTransforms';

/**
 * Opens the reverse substep on an attack apply whose reverse slot is still
 * pending.
 *
 * The attack already measured a reverse; this writes the substep when that
 * step's turn comes. The unit is held by identity — its square is read from
 * the board when the reverse resolves, after any retreat has moved it.
 *
 * @param event - Resolution context from the procedure (trusted log payload)
 * @param state - The current game state
 * @returns A new game state with the reverse written on the named attack apply
 */
export function applyOpenReverseFromAttackApplyEvent<S extends GameState>(
  event: OpenReverseFromAttackApplyEvent,
  state: S,
): S {
  const apply =
    event.attackResolutionContext === RANGED_ATTACK_RESOLUTION_CONTEXT
      ? getRangedAttackApplyState(state)
      : getMeleeAttackApplyState(state, event.defendingPlayer);

  // A reverse opens only from a pending slot — already open or bypassed is wrong.
  if (apply.reverseState !== 'pending') {
    throw new Error('Reverse is not pending on this attack apply');
  }

  // The reverse holds the unit by identity; position is read when it resolves.
  const reverseState: ReverseState = {
    completed: false,
    finalPosition: 'pending',
    reversingUnit: apply.defendingUnit,
    substepType: 'reverse',
  };

  const nextApply = {
    ...apply,
    reverseState,
  };
  return updateAttackApplyState(state, nextApply);
}
