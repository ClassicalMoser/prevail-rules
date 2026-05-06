import type {
  PlayerSide,
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
  UnitInstance,
  UnitType,
} from "@entities";
import type { GameStateForBoard } from "@game";
import { createEmptyGameState } from "@testing/createEmptyGameState";
import { createBoardWithEngagedUnits } from "./boardWithEngagedUnits";
import { createBoardWithSingleUnit } from "./boardWithSingleUnit";
import { createBoardWithUnits } from "./boardWithUnits";

/**
 * Creates a game state with a single unit at a coordinate.
 */
export function createGameStateWithSingleUnit(
  coord: StandardBoardCoordinate,
  playerSide: PlayerSide,
  options?: {
    unitType?: UnitType;
    flexibility?: number;
    attack?: number;
    facing?: UnitFacing;
    instanceNumber?: number;
  },
): GameStateForBoard<StandardBoard> {
  const gameState = createEmptyGameState();
  const board = createBoardWithSingleUnit(coord, playerSide, options);
  return { ...gameState, boardState: board };
}

/**
 * Creates a game state with engaged units at a coordinate.
 */
export function createGameStateWithEngagedUnits(
  primaryUnit: UnitInstance,
  secondaryUnit: UnitInstance,
  coord: StandardBoardCoordinate = "E-5",
  primaryFacing: UnitFacing = "north",
): GameStateForBoard<StandardBoard> {
  const gameState = createEmptyGameState();
  const board = createBoardWithEngagedUnits(primaryUnit, secondaryUnit, coord, primaryFacing);
  return { ...gameState, boardState: board };
}

/**
 * Creates a game state with units at specified positions.
 */
export function createGameStateWithUnits(
  units: Array<{
    unit: UnitInstance;
    coordinate: StandardBoardCoordinate;
    facing: UnitFacing;
  }>,
): GameStateForBoard<StandardBoard> {
  const gameState = createEmptyGameState();
  const board = createBoardWithUnits(units);
  return { ...gameState, boardState: board };
}
