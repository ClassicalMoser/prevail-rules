import type { UnitFacing, UnitInstance } from '@entities';
import type { Coordinate } from '@ruleValues';
import type { AuthoritativeGameState } from '@game';
import { createBoardWithEngagedUnits } from './boardWithEngagedUnits';
import { createGameStateWithBoard } from './gameStateWithBoard';

/**
 * Creates a game state with engaged units at a coordinate.
 */
export function createGameStateWithEngagedUnits(
  primaryUnit: UnitInstance,
  secondaryUnit: UnitInstance,
  coord: Coordinate = 'E-5',
  primaryFacing: UnitFacing = 'north',
): AuthoritativeGameState {
  const board = createBoardWithEngagedUnits(
    primaryUnit,
    secondaryUnit,
    coord,
    primaryFacing,
  );
  const gameState = createGameStateWithBoard(board);
  return gameState;
}
