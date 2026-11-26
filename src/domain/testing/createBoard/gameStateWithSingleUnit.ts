import type { PlayerSide, UnitFacing, UnitType } from '@entities';
import type { Coordinate } from '@ruleValues';
import type { AuthoritativeGameState } from '@game';
import { createBoardWithSingleUnit } from './boardWithSingleUnit';
import { createGameStateWithBoard } from './gameStateWithBoard';

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
  // The one unit alone on a standard board, chosen by the stat asked for.
  const board = createBoardWithSingleUnit(coord, playerSide, options);

  // A new standard game around that board, its index worked out from it.
  const gameState = createGameStateWithBoard(board);

  // The game, with one unit alone.
  return gameState;
}
