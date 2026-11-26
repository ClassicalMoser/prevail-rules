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
  const gameState = createEmptyGameState('standard');
  return replaceBoard(gameState, board);
}
