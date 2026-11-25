import type { Board, PlayerSide } from '@entities';
import { coordinateLayoutMap } from '@ruleValues';
import type { Coordinate } from '@ruleValues';
import { findCoordinateAtPosition } from '@queries';
import { throwIfUndefined } from '@utils';

/** Depth of each side's deployment belt (KISS provisional). */
export const SETUP_ZONE_BACK_ROWS = 3 as const;

/**
 * Columns trimmed from each east/west edge of the deployment belt.
 *
 * TODO(misleading): "ranks" names columns here, but in the rules a rank is
 * units standing shoulder to shoulder across the board (§4.3.5), and §3.5.4
 * speaks of columns. Settle by renaming to `SETUP_ZONE_EXCLUDED_SIDE_COLUMNS`,
 * with its exports in the barrels and `src/domain/index.ts`.
 */
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
 *
 * This is the bare-board deployment zone of §3.5.4: the three rows nearest
 * a side's own edge, less the two columns at each end, which are the open
 * flanks nobody begins in. `getLegalSetupUnits` offers its empty spaces.
 *
 * @param board - The board, read only for its size
 * @param player - The side whose zone to list
 * @returns The zone's spaces, row by row from the north, west to east
 */
export function getSetupZoneCoordinates(
  board: Board,
  player: PlayerSide,
): Coordinate[] {
  // The board's size fixes how many rows deep and spaces wide it is. Every
  // size is deeper than the belt and wider than both trimmed edges together
  // (§2.1.3), so the belt always fits.
  const { depth, frontage } = coordinateLayoutMap[board.boardType];

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

  // Every space this side may deploy into.
  return coordinates;
}
