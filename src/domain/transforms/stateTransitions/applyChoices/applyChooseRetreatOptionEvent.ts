import type { ChooseRetreatOptionEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import { getRetreatState, isSameMovePath } from '@queries';
import { updateRetreatState } from '@transforms/pureTransforms';

/**
 * Applies a ChooseRetreatOptionEvent: the player's choice among equally small
 * retreats (§9.1.3) is recorded as the retreat to carry out. It does not move
 * the unit — {@link applyResolveRetreatEvent} does that.
 *
 * Retreat state can be found in:
 * - AttackApplyState (ranged attack or melee resolution)
 * - Front engagement nested retreat (movement resolution)
 *
 * Event is assumed pre-validated (its path is one of the retreats offered).
 */
export function applyChooseRetreatOptionEvent<S extends GameState>(
  event: ChooseRetreatOptionEvent,
  state: S,
): S {
  const retreatState = getRetreatState(state, event.player);
  // The path names one of the offered retreats; that one is carried out.
  const chosen = retreatState.legalRetreatOptions.find((option) =>
    isSameMovePath(option.path, event.path),
  );
  if (chosen === undefined) {
    throw new Error('The chosen retreat is not one of those offered');
  }
  const newRetreatState: RetreatState = {
    ...retreatState,
    chosenRetreat: chosen,
  };
  const updated = updateRetreatState(state, newRetreatState);
  return updated;
}
