import type { Board } from '@entities';
import type { AuthoritativeGameState } from '@game';
import { createEmptyGameState } from '@factories';
import { replaceBoard } from '@testing/replaceBoard';

/**
 * A new standard game with this board in place, its index set from the board
 * as play would set it. For a spec that builds a board and then asks the game
 * where something stands.
 */
export function createGameStateWithBoard(board: Board): AuthoritativeGameState {
  // A new standard game, its piles empty and White holding the initiative.
  const gameState = createEmptyGameState('standard');

  // The board goes in whole, and the index is worked out afresh from it.
  const withBoard = replaceBoard(gameState, board);

  // The game, which now finds every unit where the board has it.
  return withBoard;
}
