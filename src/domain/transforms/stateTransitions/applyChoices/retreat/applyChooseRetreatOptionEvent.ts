import type { ChooseRetreatOptionEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import { getRetreatState } from '@queries';
import { updateRetreatState } from '@transforms/pureTransforms';

/**
 * Applies a ChooseRetreatOptionEvent: the player's choice among equally small
 * retreats (§9.1.3) is recorded as the retreat to carry out. It does not move
 * the unit — `applyResolveRetreatEvent` does that.
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
  // The path chosen is the retreat to carry out; validation has already
  // checked that it was one of those offered.
  const retreatState = getRetreatState(state, event.player);
  const newRetreatState: RetreatState = {
    ...retreatState,
    chosenRetreatPath: event.path,
  };
  const updated = updateRetreatState(state, newRetreatState);
  return updated;
}
