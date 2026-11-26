import type { PlayerSide, UnitFacing, UnitType } from '@entities';
import type { Coordinate } from '@ruleValues';
import type { AuthoritativeGameState } from '@game';
import { createBoardWithSingleUnit } from './boardWithSingleUnit';
import { createEmptyGameState } from '@factories';
import { replaceBoard } from '@testing/replaceBoard';

/**
 * Creates a game state with a single unit at a coordinate.
 */
export function createGameStateWithSingleUnit(
  coord: Coordinate,
  playerSide: PlayerSide,
  options?: {
    unitType?: UnitType;
    flexibility?: number;
    attack?: number;
    facing?: UnitFacing;
    instanceNumber?: number;
  },
): AuthoritativeGameState {
  const gameState = createEmptyGameState('standard');
  const board = createBoardWithSingleUnit(coord, playerSide, options);
  return replaceBoard(gameState, board);
}
