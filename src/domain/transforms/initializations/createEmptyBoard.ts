import type {
  Board,
  BoardSpace,
  CoordinateLayout,
  LargeBoard,
  SmallBoard,
  StandardBoard,
} from '@entities';
import {
  largeCoordinateLayout,
  smallCoordinateLayout,
  standardCoordinateLayout,
} from '@entities';

/**
 * Creates an empty board space with default values.
 * All spaces start as plain terrain, elevation 0, no water, no units.
 */
function createEmptyBoardSpace(): BoardSpace {
  return {
    terrainType: 'plain',
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
      presenceType: 'none',
    },
    commanders: new Set(),
  };
}

/**
 * Creates an empty board using the coordinate layout.
 * Generates all coordinates and initializes them with empty spaces.
 */
function createEmptyBoardWithLayout<
  TBoard extends Board,
  TCoordinate extends string,
>(
  boardType: 'standard' | 'small' | 'large',
  layout: CoordinateLayout<TCoordinate>,
): TBoard {
  const board: Record<string, BoardSpace> = {};

  // Generate all coordinates by combining row letters and column numbers
  for (const row of layout.rowLetters) {
    for (const column of layout.columnNumbers) {
      const coordinate = layout.createCoordinate(row, column);
      board[coordinate] = createEmptyBoardSpace();
    }
  }

  return {
    boardType,
    board: board as Record<TCoordinate, BoardSpace>,
  } as TBoard;
}

/**
 * Creates an empty standard board with all coordinates initialized to default spaces.
 */
export function createEmptyStandardBoard(): StandardBoard {
  return createEmptyBoardWithLayout('standard', standardCoordinateLayout);
}

/**
 * Creates an empty small board with all coordinates initialized to default spaces.
 */
export function createEmptySmallBoard(): SmallBoard {
  return createEmptyBoardWithLayout(
    'small',
    smallCoordinateLayout,
  ) as SmallBoard;
}

/**
 * Creates an empty large board with all coordinates initialized to default spaces.
 */
export function createEmptyLargeBoard(): LargeBoard {
  return createEmptyBoardWithLayout(
    'large',
    largeCoordinateLayout,
  ) as LargeBoard;
}
