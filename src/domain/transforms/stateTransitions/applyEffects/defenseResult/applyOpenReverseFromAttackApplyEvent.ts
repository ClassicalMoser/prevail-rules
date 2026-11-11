import type { OpenReverseFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import { createOpenedReverseState } from '@factories';
import { getAttackApplyAwaitingOpen } from '@queries';
import { updateAttackApplyState } from '@transforms/pureTransforms';

/**
 * Opens the reverse substep on an attack apply whose reverse slot is still
 * pending.
 *
 * The attack already measured a reverse; this writes the substep when that
 * step's turn comes. The unit is held by identity — its square is read from
 * the board when the reverse resolves, after any retreat has moved it.
 *
 * @param _event - The effect; which apply it opens on is the state's to name
 * @param state - The current game state
 * @returns A new game state with the reverse written on the named attack apply
 */
export function applyOpenReverseFromAttackApplyEvent<S extends GameState>(
  _event: OpenReverseFromAttackApplyEvent,
  state: S,
): S {
  // The apply whose reverse opens next, in the order results take effect.
  const apply = getAttackApplyAwaitingOpen(state, 'reverse');

  // The reverse holds the unit by identity; position is read when it resolves.
  const reverseState = createOpenedReverseState(apply.defendingUnit);

  const nextApply = {
    ...apply,
    reverseState,
  };
  return updateAttackApplyState(state, nextApply);
}
