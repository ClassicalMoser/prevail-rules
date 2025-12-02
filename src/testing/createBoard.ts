import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
  UnitInstance,
} from "src/entities/index.js";
import type { PlayerSide } from "src/entities/player/playerSide.js";
import type { UnitType } from "src/entities/unit/unitType.js";
import { createUnitInstance } from "src/utils/createUnitInstance.js";
import { getUnitByStatValue } from "src/utils/getUnitByStatValue.js";
import { createEmptyStandardBoard } from "../functions/createEmptyBoard.js";

/**
 * Creates a board with units at specified positions.
 * This is a core domain operation for setting up game states.
 *
 * @param units - Array of unit placements, each specifying unit, coordinate, and facing
 * @returns A standard board with the specified units placed
 */
export function createBoardWithUnits(
  units: Array<{
    unit: UnitInstance;
    coordinate: StandardBoardCoordinate;
    facing: UnitFacing;
  }>
): StandardBoard {
  const board = createEmptyStandardBoard();
  for (const { unit, coordinate, facing } of units) {
    board.board[coordinate] = {
      ...board.board[coordinate],
      unitPresence: {
        presenceType: "single",
        unit,
        facing,
      },
    };
  }
  return board;
}

/**
 * Creates a board with a single unit at a coordinate.
 * This is a convenience function for common test and setup scenarios.
 *
 * @param coord - The coordinate where the unit should be placed
 * @param playerSide - The player side of the unit
 * @param options - Optional configuration for the unit
 * @param options.unitType - Specific unit type to use (if not provided, will use stat-based lookup)
 * @param options.flexibility - Flexibility stat value (used if unitType not provided)
 * @param options.attack - Attack stat value (used if unitType not provided)
 * @param options.facing - Unit facing (defaults to "north")
 * @param options.instanceNumber - Unit instance number (defaults to 1)
 * @returns A standard board with the specified unit placed
 */
export function createBoardWithSingleUnit(
  coord: StandardBoardCoordinate,
  playerSide: PlayerSide,
  options?: {
    unitType?: UnitType;
    flexibility?: number;
    attack?: number;
    facing?: UnitFacing;
    instanceNumber?: number;
  }
): StandardBoard {
  const board = createEmptyStandardBoard();
  const facing = options?.facing ?? "north";
  const instanceNumber = options?.instanceNumber ?? 1;

  let unit: UnitInstance;
  if (options?.unitType) {
    unit = createUnitInstance(playerSide, options.unitType, instanceNumber);
  } else if (options?.flexibility !== undefined) {
    const unitType = getUnitByStatValue("flexibility", options.flexibility);
    if (!unitType) {
      throw new Error(
        `No unit found with flexibility value ${options.flexibility}.`
      );
    }
    unit = createUnitInstance(playerSide, unitType, instanceNumber);
  } else if (options?.attack !== undefined) {
    const unitType = getUnitByStatValue("attack", options.attack);
    if (!unitType) {
      throw new Error(`No unit found with attack value ${options.attack}.`);
    }
    unit = createUnitInstance(playerSide, unitType, instanceNumber);
  } else {
    // Default: use attack value 3 (common in tests)
    const unitType = getUnitByStatValue("attack", 3);
    if (!unitType) {
      throw new Error("No unit found with attack value 3.");
    }
    unit = createUnitInstance(playerSide, unitType, instanceNumber);
  }

  board.board[coord] = {
    ...board.board[coord],
    unitPresence: {
      presenceType: "single",
      unit,
      facing,
    },
  };
  return board;
}

/**
 * Creates a board with engaged units at a coordinate.
 * This represents two units in combat at the same space.
 *
 * @param primaryUnit - The primary unit in the engagement
 * @param secondaryUnit - The secondary unit in the engagement
 * @param coord - The coordinate where the engagement occurs (defaults to "E-5")
 * @param primaryFacing - The facing of the primary unit (defaults to "north")
 * @returns A standard board with the engaged units placed
 */
export function createBoardWithEngagedUnits(
  primaryUnit: UnitInstance,
  secondaryUnit: UnitInstance,
  coord: StandardBoardCoordinate = "E-5",
  primaryFacing: UnitFacing = "north"
): StandardBoard {
  const board = createEmptyStandardBoard();
  board.board[coord] = {
    ...board.board[coord],
    unitPresence: {
      presenceType: "engaged",
      primaryUnit,
      primaryFacing,
      secondaryUnit,
    },
  };
  return board;
}

/**
 * Creates a board with a commander at a coordinate.
 * Commanders are special units that can move independently.
 *
 * @param playerSide - The player side of the commander
 * @param coordinate - The coordinate where the commander should be placed
 * @param board - Optional existing board to modify (creates new board if not provided)
 * @returns A standard board with the commander placed
 */
export function createBoardWithCommander(
  playerSide: PlayerSide,
  coordinate: StandardBoardCoordinate,
  board?: StandardBoard
): StandardBoard {
  const targetBoard = board ?? createEmptyStandardBoard();
  targetBoard.board[coordinate] = {
    ...targetBoard.board[coordinate],
    commanders: new Set([playerSide]),
  };
  return targetBoard;
}
