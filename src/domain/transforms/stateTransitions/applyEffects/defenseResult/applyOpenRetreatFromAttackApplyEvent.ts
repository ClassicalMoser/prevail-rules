import type { OpenRetreatFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import { createOpenedRetreatState } from '@factories';
import { getAttackApplyAwaitingOpen } from '@queries';
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

  // The defender falls back. The procedure worked out the legal retreats
  // from where it stands; they are written as given.
  // The factory settles what follows from them: a lone retreat is carried
  // out as it stands, a tie waits for the owner's choice (§9.1.3), and none
  // at all leaves a rout due in the retreat's place (§9.1.6).
  const retreatState = createOpenedRetreatState(
    apply.defendingUnit,
    event.retreatPaths,
  );

  // The retreat takes the apply's retreat slot. The reverse and rout slots
  // are left as the attack measured them: they come later in the order
  // (§7.5.2), and open on their own turns.
  const nextApply = {
    ...apply,
    retreatState,
  };

  // The game with the retreat open, ready for its path to be chosen or
  // taken, or for the rout that takes its place.
  const opened = updateAttackApplyState(state, nextApply);
  return opened;
}
