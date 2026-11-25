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
 *
 * @param event - The retreating unit's owner, and the path they chose
 * @param state - The game, with that player's retreat open
 * @returns The game with the chosen path recorded on the retreat
 * @throws Error when that player has no retreat open
 */
export function applyChooseRetreatOptionEvent<S extends GameState>(
  event: ChooseRetreatOptionEvent,
  state: S,
): S {
  // The path chosen is the retreat to carry out; validation has already
  // checked that it was one of those offered.
  // The owner of the unit falling back is the one who chooses, so the
  // retreat is the one their unit is making, wherever it was opened.
  const retreatState = getRetreatState(state, event.player);
  const newRetreatState: RetreatState = {
    ...retreatState,
    chosenRetreatPath: event.path,
  };

  // Written back to the slot the retreat was opened in.
  const updated = updateRetreatState(state, newRetreatState);

  // The game, ready for the retreat to be carried out.
  return updated;
}
