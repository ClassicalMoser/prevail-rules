import { createOpenedCleanupPhaseState } from '@factories';
import type { GameState, ResolveMeleePhaseState } from '@game';
import { getResolveMeleePhaseState } from '@queries';
import {
  addCompletedPhase,
  markPhaseAsComplete,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompleteResolveMeleePhaseEvent to the game state.
 * Marks the current phase state's step as `complete`, records it in `completedPhases`,
 * and advances to cleanup phase.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via {@link getResolveMeleePhaseState} (throws if not `resolveMelee`).
 *
 * Takes no event, because this effect carries no payload fields; the dispatch in
 * `applyGameEffectEvent` has nothing to hand it.
 *
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompleteResolveMeleePhaseEvent<S extends GameState>(
  state: S,
): S {
  // Every engagement has been fought (§4.4.2), and the phase ends only
  // while the game is in it.
  const phaseState: ResolveMeleePhaseState = getResolveMeleePhaseState(state);

  // Mark the current phase as complete
  // Phase 4 has one working step, so it is marked done here rather than by
  // the last melee.
  const completedPhase: ResolveMeleePhaseState =
    markPhaseAsComplete(phaseState);

  // Add the completed phase to the set of completed phases
  const stateWithCompletedPhase = addCompletedPhase(state, completedPhase);

  // Create the new cleanup phase state
  // Cleanup opens with this round's cards leaving play (§4.5.1); neither
  // player has chosen whether to rally yet.
  const newPhaseState = createOpenedCleanupPhaseState();

  // Phase 4 recorded as done, and Cleanup under way.
  const cleaningUp = updatePhaseState(stateWithCompletedPhase, newPhaseState);
  return cleaningUp;
}
