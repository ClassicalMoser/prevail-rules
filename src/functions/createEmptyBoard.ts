import type { BoardConfig } from "../entities/board/boardConfig.js";
import type { BoardSpace } from "../entities/board/boardSpace.js";
import type { LargeBoard } from "../entities/board/largeBoard/index.js";
import type { SmallBoard } from "../entities/board/smallBoard/index.js";
import type { StandardBoard } from "../entities/board/standardBoard/index.js";
import {
  largeBoardConfig,
  smallBoardConfig,
  standardBoardConfig,
} from "../entities/board/boardConfig.js";

/**
 * Creates an empty board space with default values.
 * All spaces start as plain terrain, elevation 0, no water, no units.
 */
function createEmptyBoardSpace(): BoardSpace {
  return {
    terrainType: "plain",
    elevation: {
      northWest: 0,
      northEast: 0,
      southWest: 0,
      southEast: 0,
    },
    waterCover: {
      north: false,
      northEast: false,
      east: false,
      southEast: false,
      south: false,
      southWest: false,
      west: false,
      northWest: false,
    },
    unitPresence: {
      presenceType: "none",
    },
  };
}

/**
 * Creates an empty board using the board config pattern.
 * Generates all coordinates and initializes them with empty spaces.
 */
function createEmptyBoardWithConfig<TCoordinate extends string>(
  boardType: "standard" | "small" | "large",
  config: BoardConfig<TCoordinate>,
): StandardBoard | SmallBoard | LargeBoard {
  const board: Record<string, BoardSpace> = {};

  // Generate all coordinates by combining row letters and column numbers
  for (const row of config.rowLetters) {
    for (const column of config.columnNumbers) {
      const coordinate = config.createCoordinate(row, column);
      board[coordinate] = createEmptyBoardSpace();
    }
  }

  return {
    boardType,
    board: board as Record<TCoordinate, BoardSpace>,
  } as StandardBoard | SmallBoard | LargeBoard;
}

/**
 * Creates an empty standard board with all coordinates initialized to default spaces.
 */
export function createEmptyStandardBoard(): StandardBoard {
  return createEmptyBoardWithConfig(
    "standard",
    standardBoardConfig,
  ) as StandardBoard;
}

/**
 * Creates an empty small board with all coordinates initialized to default spaces.
 */
export function createEmptySmallBoard(): SmallBoard {
  return createEmptyBoardWithConfig("small", smallBoardConfig) as SmallBoard;
}

/**
 * Creates an empty large board with all coordinates initialized to default spaces.
 */
export function createEmptyLargeBoard(): LargeBoard {
  return createEmptyBoardWithConfig("large", largeBoardConfig) as LargeBoard;
}
