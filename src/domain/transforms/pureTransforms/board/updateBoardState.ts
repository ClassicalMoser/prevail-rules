import type { Board } from '@entities';
import type { GameState } from '@game';
import { deriveGameStateIndex } from '@queries';

/**
 * Creates a new game state with the board state updated.
 * Handles the immutable update of board state.
 *
 * The index of where every piece stands is set afresh from the new board, so
 * the two never disagree. Any write to the board goes through here for that
 * reason: a state given a new board any other way keeps the old board's index.
 *
 * @param state - The current game state
 * @param boardState - The new board state to set
 * @returns A new game state with the updated board state, and its index
 *
 * @example
 * ```ts
 * const newBoard = addCommanderToBoard(state.boardState, 'black', 'E-5');
 * const newState = updateBoardState(state, newBoard);
 * ```
 */
export function updateBoardState<S extends GameState>(
  state: S,
  boardState: Board,
): S {
  // The new board in place of the old.
  const withBoard: S = {
    ...state,
    boardState,
  };

  // Where every piece now is, read from the board just written.
  const updated: S = {
    ...withBoard,
    index: deriveGameStateIndex(withBoard),
  };
  return updated;
}
