import type { Board, BoardSpace, BoardType } from '@entities';
import { coordinateLayoutMap } from '@entities';

/**
 * Creates an empty board space with default values.
 * All spaces start as plain terrain, elevation 0, no water, no units.
 *
 * TODO(misleading): a board space has no water field; what this sets is open
 * ground cover, difficulty 1, not blocking, and no commanders. The same "water"
 * appears in `BoardSpace`'s own header in `@entities`. Settled by naming the
 * fields set here, once water is decided for the space.
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
 * Creates an empty board of one size. The size alone says which spaces the
 * board has: its layout lists them, and each starts empty.
 *
 * @param boardType - The size to build
 * @returns A board holding every space of that size, each empty
 */
export function createEmptyBoard(boardType: BoardType): Board {
  // The size's layout is the one definition of which spaces it has.
  const layout = coordinateLayoutMap[boardType];

  // The board holds exactly the spaces its size lays out, each starting
  // empty: open, level ground with nobody on it (§2.1.4).
  const spaces: Board['board'] = {};
  for (const coordinate of layout.coordinates) {
    spaces[coordinate] = createEmptyBoardSpace();
  }

  // The board, tagged with its size so every reader finds the same layout.
  const board: Board = { board: spaces, boardType };
  return board;
}
