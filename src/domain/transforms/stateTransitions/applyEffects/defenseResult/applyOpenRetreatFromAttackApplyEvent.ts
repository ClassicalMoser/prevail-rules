import type { OpenRetreatFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import { createOpenedRetreatState } from '@factories';
import { getAttackApplyAwaitingOpen, getPositionOfUnit } from '@queries';
import { updateAttackApplyState } from '@transforms/pureTransforms';

/**
 * Opens the retreat substep on an attack apply whose retreat slot is still
 * pending.
 *
 * The attack already measured a retreat; this writes the substep when that
 * step's turn comes, with the legal retreats its procedure recorded on the
 * event from the board at that moment.
 *
 * @param event - The effect; which apply it opens on is the state's to name
 * @param state - The current game state
 * @returns A new game state with the retreat written on the named attack apply
 */
export function applyOpenRetreatFromAttackApplyEvent<S extends GameState>(
  event: OpenRetreatFromAttackApplyEvent,
  state: S,
): S {
  // The apply whose retreat opens next, in the order results take effect.
  const apply = getAttackApplyAwaitingOpen(state, 'retreat');

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
