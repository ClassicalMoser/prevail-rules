import type { ChooseRetreatOptionEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import { findRetreatState } from '@queries';
import { updateRetreatState } from '@transforms/pureTransforms';

/**
 * Applies a ChooseRetreatOptionEvent to the game state.
 * Updates the finalPosition in the retreat state (does not move the unit —
 * {@link applyResolveRetreatEvent} does that).
 *
 * Retreat state can be found in:
 * - AttackApplyState (ranged attack or melee resolution)
 * - Front engagement nested retreat (movement resolution)
 *
 * Event is assumed pre-validated (correct phase and player has an active retreat).
 */
export function applyChooseRetreatOptionEvent<S extends GameState>(
  event: ChooseRetreatOptionEvent,
  state: S,
): S {
  const retreatState = findRetreatState(state, event.player);
  const newRetreatState: RetreatState = {
    ...retreatState,
    finalPosition: event.retreatOption,
  };
  return updateRetreatState(state, newRetreatState);
}
