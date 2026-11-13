import type { Board, BoardSpace, CoordinateLayout } from '@entities';

/**
 * Creates an empty board space with default values.
 * All spaces start as plain terrain, elevation 0, no water, no units.
 */
function createEmptyBoardSpace(): BoardSpace {
  return {
    commanders: [],
    elevation: {
      northEast: 0,
      northWest: 0,
      southEast: 0,
      southWest: 0,
    },
    terrainDifficulty: 1,
    groundCover: 'open',
    unitPresence: {
      presenceType: 'none',
    },
    blocking: false,
  };
}

/**
 * Creates an empty board using the coordinate layout.
 * Generates all coordinates and initializes them with empty spaces.
 */
export function createEmptyBoardWithLayout(
  boardType: Board['boardType'],
  layout: CoordinateLayout,
): Board {
  const board: Board['board'] = {};

  for (const row of layout.rowLetters) {
    for (const column of layout.columnNumbers) {
      const coordinate = layout.createCoordinate(row, column);
      board[coordinate] = createEmptyBoardSpace();
    }
  }

  return {
    board,
    boardType,
  };
}
