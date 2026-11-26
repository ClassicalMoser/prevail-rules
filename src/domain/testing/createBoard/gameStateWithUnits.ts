import type { UnitWithPlacement } from '@entities';
import type { AuthoritativeGameState } from '@game';
import { createBoardWithUnits } from './boardWithUnits';
import { createEmptyGameState } from '@factories';
import { replaceBoard } from '@testing/replaceBoard';

/**
 * Creates a game state with units at specified positions.
 */
export function createGameStateWithUnits(
  units: UnitWithPlacement[],
): AuthoritativeGameState {
  const gameState = createEmptyGameState('standard');
  const board = createBoardWithUnits(units);
  return replaceBoard(gameState, board);
}
