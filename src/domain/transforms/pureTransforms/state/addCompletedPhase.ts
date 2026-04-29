import type { Board } from "@entities";
import type { GameStateWithBoard, PhaseState } from "@game";
import { updateRoundState } from "@transforms/pureTransforms";

/**
 * Adds a completed phase to the completed phases set.
 * Handles the immutable update of the completedPhases set.
 *
 * @param state - The current game state
 * @param completedPhase - The phase state to add to completed phases
 * @returns A new game state with the completed phase added
 *
 * @example
 * ```ts
 * const newState = addCompletedPhase(state, currentPhaseState);
 * ```
 */
export function addCompletedPhase<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
  completedPhase: PhaseState,
): GameStateWithBoard<TBoard> {
  const newCompletedPhases = new Set(state.currentRoundState.completedPhases);
  newCompletedPhases.add(completedPhase);

  // Update the round state with the new completed phases
  const newState = updateRoundState(state, {
    ...state.currentRoundState,
    completedPhases: newCompletedPhases,
  });

  return newState;
}
