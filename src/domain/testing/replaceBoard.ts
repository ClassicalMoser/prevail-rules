import type { Board } from '@entities';
import type { GameState } from '@game';
import { deriveGameStateIndex } from '@queries';

/**
 * A game state with a whole new board put in, and its index worked out
 * afresh from it. For specs only: a fixture builds a board in one go, with
 * units no reserve ever held, and play never does that. In play, a piece
 * changes place through its writer, which overwrites its one entry.
 *
 * A new board means a new index, so the whole index is derived here, from
 * the board and the state's lists alike.
 *
 * @param state - The game to put the board in
 * @param board - The board, built by the spec
 * @returns The state with that board, and the index it calls for
 */
export function replaceBoard<S extends GameState>(state: S, board: Board): S {
  // The board goes in whole, the rest of the game as it was.
  const withBoard: S = { ...state, boardState: board };

  // Every unit and commander is filed afresh where the new board has it.
  const indexed: S = { ...withBoard, index: deriveGameStateIndex(withBoard) };

  // The game, its board and its index agreeing.
  return indexed;
}
