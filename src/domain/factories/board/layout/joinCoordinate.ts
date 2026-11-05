import type { Coordinate } from '@entities';
import { allCoordinates } from '@entities';

/**
 * Map from joined `"row-column"` string → that same string as {@link Coordinate}.
 * Lets {@link joinCoordinate} narrow without a type assertion: if the key is
 * in the map, the value is already typed as Coordinate.
 */
const coordinateByKey = new Map<string, Coordinate>(
  allCoordinates.map((coordinate) => [coordinate, coordinate]),
);

/**
 * Names the space at a row letter and column number.
 *
 * **Layout modules only** — not re-exported from the layout or `@factories`
 * barrels. Callers that need a coordinate from parts should use the board's
 * {@link CoordinateLayout.createCoordinate} (which delegates here).
 *
 * Size membership is a value concern: layouts pass parts from their own
 * `rowLetters` / `columnNumbers` (or from index math already bounded against
 * those arrays). This function only checks that the space exists on some
 * board.
 *
 * @param row - Row letter string (e.g. `"E"`)
 * @param column - Column number string (e.g. `"5"`)
 * @returns The joined coordinate when known
 * @throws {Error} When the joined string is not a known coordinate
 */
export function joinCoordinate(row: string, column: string): Coordinate {
  // The space's name is its row and column, joined.
  const joined = `${row}-${column}`;
  // Only a space on some board has a name; anything else is a caller's bug.
  const coordinate = coordinateByKey.get(joined);
  if (coordinate === undefined) {
    throw new Error(`Invalid coordinate: ${joined}`);
  }
  return coordinate;
}
