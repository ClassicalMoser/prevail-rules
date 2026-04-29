import type { Board } from "@entities";
import type { GameStateWithBoard } from "@game";

/**
 * Creates a new game state with the board state updated.
 * Handles the immutable update of board state.
 *
 * @param state - The current game state
 * @param boardState - The new board state to set
 * @returns A new game state with the updated board state
 *
 * @example
 * ```ts
 * const newBoard = addCommanderToBoard(state.boardState, 'black', 'E-5');
 * const newState = updateBoardState(state, newBoard);
 * ```
 */
export function updateBoardState<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
  boardState: TBoard,
): GameStateWithBoard<TBoard> {
  return {
    ...state,
    boardState,
  };
}
