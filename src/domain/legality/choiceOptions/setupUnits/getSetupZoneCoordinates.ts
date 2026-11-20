import type { Board, Coordinate, PlayerSide } from '@entities';
import { coordinateLayoutMap } from '@entities';
import { findCoordinateAtPosition } from '@queries';
import { throwIfUndefined } from '@utils';

/** Depth of each side's deployment belt (KISS provisional). */
export const SETUP_ZONE_BACK_ROWS = 3 as const;

/** Columns trimmed from each east/west edge of the deployment belt. */
export const SETUP_ZONE_EXCLUDED_SIDE_RANKS = 2 as const;

/**
 * Provisional setup / deployment coordinates for a player.
 *
 * - **White**: northernmost {@link SETUP_ZONE_BACK_ROWS} row letters (toward A).
 * - **Black**: southernmost {@link SETUP_ZONE_BACK_ROWS} row letters (toward the
 *   last letter).
 * - **Columns**: all files except the outer {@link SETUP_ZONE_EXCLUDED_SIDE_RANKS}
 *   on each side.
 *
 * Derived from the board's coordinate layout so small/standard/large stay
 * consistent. Per-mode / scenario zones will replace this later.
 */
export function getSetupZoneCoordinates(
  board: Board,
  player: PlayerSide,
): Coordinate[] {
  const { depth, frontage } = coordinateLayoutMap[board.boardType];

  if (depth < SETUP_ZONE_BACK_ROWS) {
    return [];
  }
  if (frontage <= SETUP_ZONE_EXCLUDED_SIDE_RANKS * 2) {
    return [];
  }

  // White's belt is the rows nearest the north edge, Black's the rows
  // nearest the south, counted as row positions from 0 at row A.
  const firstRow = player === 'white' ? 0 : depth - SETUP_ZONE_BACK_ROWS;

  // The columns at each end are left out: they are the open flanks, and
  // nobody begins in them (§3.5.4).
  const firstColumn = SETUP_ZONE_EXCLUDED_SIDE_RANKS;
  const lastColumn = frontage - SETUP_ZONE_EXCLUDED_SIDE_RANKS;

  // Each space of the belt, row by row from the north, read from the layout
  // by its position.
  const coordinates: Coordinate[] = [];
  for (let row = firstRow; row < firstRow + SETUP_ZONE_BACK_ROWS; row++) {
    for (let column = firstColumn; column < lastColumn; column++) {
      // The belt lies inside the board's rows and columns, so a missing
      // space is a fault in the bounds above, not an edge.
      const coordinate = throwIfUndefined(
        findCoordinateAtPosition(board, { column, row }),
        `Setup zone position ${row},${column} is off the ${board.boardType} board`,
      );
      coordinates.push(coordinate);
    }
  }
  return coordinates;
}
