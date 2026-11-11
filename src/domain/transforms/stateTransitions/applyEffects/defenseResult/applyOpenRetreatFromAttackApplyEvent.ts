import type { OpenRetreatFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import { createOpenedRetreatState } from '@factories';
import { getAttackApplyStateAt, getPositionOfUnit } from '@queries';
import { updateAttackApplyState } from '@transforms/pureTransforms';

/**
 * Opens the retreat substep on an attack apply whose retreat slot is still
 * pending.
 *
 * The attack already measured a retreat; this writes the substep when that
 * step's turn comes, with the legal retreats its procedure recorded on the
 * event from the board at that moment.
 *
 * @param event - Resolution context from the procedure (trusted log payload)
 * @param state - The current game state
 * @returns A new game state with the retreat written on the named attack apply
 */
export function applyOpenRetreatFromAttackApplyEvent<S extends GameState>(
  event: OpenRetreatFromAttackApplyEvent,
  state: S,
): S {
  const apply = getAttackApplyStateAt(state, event);

  // A retreat opens only from a pending slot — already open or bypassed is wrong.
  if (apply.retreatState !== 'pending') {
    throw new Error('Retreat is not pending on this attack apply');
  }

  // The unit's square is read from the board now, in case a prior step moved it.
  const placement = getPositionOfUnit(state.boardState, apply.defendingUnit);
  const retreatingUnit = {
    placement,
    unit: apply.defendingUnit,
  };
  // The procedure worked out the legal retreats; they are written as given.
  const retreatState = createOpenedRetreatState(
    retreatingUnit,
    event.retreatPaths,
  );

  const nextApply = {
    ...apply,
    retreatState,
  };
  return updateAttackApplyState(state, nextApply);
}
