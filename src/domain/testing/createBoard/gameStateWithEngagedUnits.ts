import type { UnitFacing, UnitInstance } from '@entities';
import type { Coordinate } from '@ruleValues';
import type { AuthoritativeGameState } from '@game';
import { createBoardWithEngagedUnits } from './boardWithEngagedUnits';
import { createEmptyGameState } from '@factories';
import { replaceBoard } from '@testing/replaceBoard';

/**
 * Creates a game state with engaged units at a coordinate.
 */
export function createGameStateWithEngagedUnits(
  primaryUnit: UnitInstance,
  secondaryUnit: UnitInstance,
  coord: Coordinate = 'E-5',
  primaryFacing: UnitFacing = 'north',
): AuthoritativeGameState {
  const gameState = createEmptyGameState('standard');
  const board = createBoardWithEngagedUnits(
    primaryUnit,
    secondaryUnit,
    coord,
    primaryFacing,
  );
  return replaceBoard(gameState, board);
}
