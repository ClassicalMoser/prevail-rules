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
  const board = createBoardWithUnits(units);
  const gameState = createGameStateWithBoard(board);
  return gameState;
}
