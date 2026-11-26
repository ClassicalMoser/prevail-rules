import type { CompletePlayCardsPhaseEvent } from '@events';
import { createOpenedMoveCommandersPhaseState } from '@factories';
import type { GameState } from '@game';

import { getPlayCardsPhaseState } from '@queries';
import {
  addCompletedPhase,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompletePlayCardsPhaseEvent to the game state.
 * Records the current phase state as completed and advances to moveCommanders phase.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via {@link getPlayCardsPhaseState} (throws if not `playCards`). The
 * current phase state is read only to snapshot it into `completedPhases`.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields.
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompletePlayCardsPhaseEvent<S extends GameState>(
  _event: CompletePlayCardsPhaseEvent,
  state: S,
): S {
  // Only Play Cards ends here; the read throws in any other phase.
  const phaseState = getPlayCardsPhaseState(state);

  // Add the completed phase to the set of completed phases
  // Both cards are in play and initiative is decided, so Phase 1 is done.
  const stateWithCompletedPhase = addCompletedPhase(state, phaseState);

  // The first player moves their commander first (§4.2.1). A fallen
  // commander's turn is passed over by its own effect.
  const newPhaseState = createOpenedMoveCommandersPhaseState();

  // Phase 1 recorded as done, and the commanders to move.
  const moving = updatePhaseState(stateWithCompletedPhase, newPhaseState);
  return moving;
}
