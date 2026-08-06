import type {
  GameStateForVisibility,
  GameStateVisibility,
  PhaseState,
} from '@game';

/**
 * Returns a new game state with the phase state replaced, preserving visibility.
 *
 * @param state - The current game state
 * @param phaseState - The new phase state to set
 * @returns A new game state with the updated phase state
 */
export function updatePhaseState<V extends GameStateVisibility>(
  state: GameStateForVisibility<V>,
  phaseState: PhaseState,
): GameStateForVisibility<V> {
  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: phaseState,
    },
  };
}
