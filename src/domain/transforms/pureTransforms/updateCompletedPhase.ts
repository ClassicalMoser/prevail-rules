import type { Board, GameState, PhaseState } from '@entities';

/**
 * Creates a new game state with a completed phase added to the completed phases set.
 * Handles the immutable update of the completedPhases set.
 *
 * @param state - The current game state
 * @param completedPhase - The phase state to add to completed phases
 * @returns A new game state with the completed phase added
 *
 * @example
 * ```ts
 * const newState = updateCompletedPhase(state, currentPhaseState);
 * ```
 */
export function updateCompletedPhase<TBoard extends Board>(
  state: GameState<TBoard>,
  completedPhase: PhaseState<TBoard>,
): GameState<TBoard> {
  const newCompletedPhases = new Set(state.currentRoundState.completedPhases);
  newCompletedPhases.add(completedPhase);

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      completedPhases: newCompletedPhases,
    },
  };
}
