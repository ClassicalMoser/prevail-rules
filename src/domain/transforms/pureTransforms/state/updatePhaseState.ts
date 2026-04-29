import type { Board } from "@entities";
import type { GameStateWithBoard, PhaseState } from "@game";

/**
 * Creates a new game state with the phase state updated.
 * Handles the nested spreading required to update phase state immutably.
 *
 * @param state - The current game state
 * @param phaseState - The new phase state to set
 * @returns A new game state with the updated phase state
 *
 * @example
 * ```ts
 * const state = createEmptyGameState();
 * const newState = updatePhaseState(state, {
 *   phase: PLAY_CARDS_PHASE,
 *   step: 'chooseCards',
 * });
 * ```
 */
export function updatePhaseState<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
  phaseState: PhaseState,
): GameStateWithBoard<TBoard> {
  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: phaseState,
    },
  };
}
