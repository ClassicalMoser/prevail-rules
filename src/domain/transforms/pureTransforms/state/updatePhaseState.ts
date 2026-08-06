import type { GameState, PhaseState } from '@game';

/**
 * Returns a new game state with the phase state replaced, preserving visibility.
 *
 * @param state - The current game state
 * @param phaseState - The new phase state to set
 * @returns A new game state with the updated phase state
 */
export function updatePhaseState<S extends GameState>(
  state: S,
  phaseState: PhaseState,
): S {
  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: phaseState,
    },
  };
}
