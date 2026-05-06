import type { Board } from "@entities";
import type { CleanupPhaseState, GameStateForBoard, ResolveMeleePhaseStateForBoard } from "@game";
import { CLEANUP_PHASE } from "@game";
import { getResolveMeleePhaseStateForBoard } from "@queries";

import {
  addCompletedPhase,
  markPhaseAsComplete,
  updatePhaseState,
} from "@transforms/pureTransforms";

/**
 * Applies a CompleteResolveMeleePhaseEvent to the game state.
 * Marks the current phase state's step as `complete`, records it in `completedPhases`,
 * and advances to cleanup phase.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via `getResolveMeleePhaseState` (throws if not `resolveMelee`).
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields.
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompleteResolveMeleePhaseEvent<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const phaseState: ResolveMeleePhaseStateForBoard<TBoard> =
    getResolveMeleePhaseStateForBoard(state);

  // Mark the current phase as complete
  const completedPhase: ResolveMeleePhaseStateForBoard<TBoard> = markPhaseAsComplete(phaseState);

  // Add the completed phase to the set of completed phases
  const stateWithCompletedPhase = addCompletedPhase(state, completedPhase);

  // Create the new cleanup phase state
  const newPhaseState: CleanupPhaseState = {
    phase: CLEANUP_PHASE,
    step: "discardPlayedCards",
    firstPlayerRallyResolutionState: undefined,
    secondPlayerRallyResolutionState: undefined,
  };

  return updatePhaseState(stateWithCompletedPhase, newPhaseState);
}
