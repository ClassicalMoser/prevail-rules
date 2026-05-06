import type { Board } from "@entities";
import type { GameStateForBoard, PhaseStateForBoard } from "@game";

/**
 * Narrow case, update phase state for a specific board type.
 * @param state - The current game state
 * @param phaseState - The new phase state to set
 * @returns A new game state with the updated phase state
 */
export function updatePhaseState<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  phaseState: PhaseStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: phaseState,
    },
  };
}
