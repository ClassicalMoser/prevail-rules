import type { Board, Coordinate, PlayerSide } from '@entities';
import { getCoordinateLayout } from '@entities';

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
  const layout = getCoordinateLayout(board);
  const { rowLetters, columnNumbers } = layout;

  if (rowLetters.length < SETUP_ZONE_BACK_ROWS) {
    return [];
  }
  if (columnNumbers.length <= SETUP_ZONE_EXCLUDED_SIDE_RANKS * 2) {
    return [];
  }

  const rows =
    player === 'white'
      ? rowLetters.slice(0, SETUP_ZONE_BACK_ROWS)
      : rowLetters.slice(-SETUP_ZONE_BACK_ROWS);

  const columns = columnNumbers.slice(
    SETUP_ZONE_EXCLUDED_SIDE_RANKS,
    columnNumbers.length - SETUP_ZONE_EXCLUDED_SIDE_RANKS,
  );

  const coordinates: Coordinate[] = [];
  for (const row of rows) {
    for (const column of columns) {
      coordinates.push(layout.createCoordinate(row, column));
    }
  }
  return coordinates;
}
