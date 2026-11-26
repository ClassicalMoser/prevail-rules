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
  // The primary standing on the space and the secondary squared up to it.
  const board = createBoardWithEngagedUnits(
    primaryUnit,
    secondaryUnit,
    coord,
    primaryFacing,
  );

  // A new standard game around that board, its index worked out from it.
  const gameState = createGameStateWithBoard(board);

  // The game, with the two units locked in one space.
  return gameState;
}
