import type { UnitWithPlacement } from '@entities';
import type { AuthoritativeGameState } from '@game';
import { createBoardWithUnits } from './boardWithUnits';
import { createGameStateWithBoard } from './gameStateWithBoard';

/**
 * Creates a game state with units at specified positions.
 */
export function createGameStateWithUnits(
  units: UnitWithPlacement[],
): AuthoritativeGameState {
  // The units set down one at a time; two given the same space engage.
  const board = createBoardWithUnits(units);

  // A new standard game around that board, its index worked out from it.
  const gameState = createGameStateWithBoard(board);

  // The game, with every unit where the spec put it.
  return gameState;
}
