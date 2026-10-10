/**
 * Shared {@link Coordinate} vocabulary for every board size.
 *
 * Per-size products live under `smallBoard/` / `standardBoard/` / `largeBoard/`.
 * This module unions them into one type, one Zod enum, and the internal
 * {@link joinCoordinate} used by layout values.
 *
 * Nesting: small ⊂ standard ⊂ large, so the union is extensionally the large
 * product. Types do **not** brand a coordinate with board size — size is a
 * value on {@link Board.boardType} / the layout instance. Membership for a
 * given board is checked at Zod boundaries (`boardSchema`) and by layout
 * index lookups returning `-1` for out-of-range parts.
 *
 * Imports size **leaf** coordinate modules only — size barrels also re-export
 * layouts that import this file; a barrel import here would cycle.
 */

import type { AssertExact } from '@utils';
// Leaf modules only — avoid size barrels (they re-export layouts that import us).
import type { LargeBoardCoordinate } from './largeBoard/largeCoordinates';
import { largeBoardCoordinates } from './largeBoard/largeCoordinates';
import type { SmallBoardCoordinate } from './smallBoard/smallCoordinates';
import { smallBoardCoordinates } from './smallBoard/smallCoordinates';
import type { StandardBoardCoordinate } from './standardBoard/standardCoordinates';
import { standardBoardCoordinates } from './standardBoard/standardCoordinates';

import { z } from 'zod';

/**
 * Any coordinate string that appears on some board size (`"A-1"` … `"X-36"`).
 *
 * Declared as a union of the three size products for documentation and
 * AssertExact against the Zod enum. Because the sets nest, this is the same
 * set of strings as {@link LargeBoardCoordinate}.
 */
export type Coordinate =
  | StandardBoardCoordinate
  | SmallBoardCoordinate
  | LargeBoardCoordinate;

/**
 * Deduped list of every known coordinate string.
 * Order is not contract; the Set removes the overlapping small/standard
 * entries when spreading all three products.
 */
const allCoordinates = [
  ...new Set<Coordinate>([
    ...standardBoardCoordinates,
    ...smallBoardCoordinates,
    ...largeBoardCoordinates,
  ]),
];

/**
 * Map from joined `"row-column"` string → that same string as {@link Coordinate}.
 * Lets {@link joinCoordinate} narrow without a type assertion: if the key is
 * in the map, the value is already typed as Coordinate.
 */
const coordinateByKey = new Map<string, Coordinate>(
  allCoordinates.map((coordinate) => [coordinate, coordinate]),
);

/**
 * Join a row letter and column number into a {@link Coordinate}.
 *
 * **Layout modules only** — not re-exported from the board or `@entities`
 * barrels. Callers that need a coordinate from parts should use the board's
 * {@link CoordinateLayout.createCoordinate} (which delegates here).
 *
 * Size membership is a value concern: layouts pass parts from their own
 * `rowLetters` / `columnNumbers` (or from index math already bounded against
 * those arrays). This function only checks that the joined string exists in
 * the global coordinate set.
 *
 * @param row - Row letter string (e.g. `"E"`)
 * @param column - Column number string (e.g. `"5"`)
 * @returns The joined coordinate when known
 * @throws {Error} When the joined string is not a known coordinate
 */
export function joinCoordinate(row: string, column: string): Coordinate {
  const joined = `${row}-${column}`;
  const coordinate = coordinateByKey.get(joined);
  if (coordinate === undefined) {
    throw new Error(`Invalid coordinate: ${joined}`);
  }
  return coordinate;
}

const _coordinateSchemaObject = z.enum(allCoordinates);

type CoordinateSchemaType = z.infer<typeof _coordinateSchemaObject>;

/**
 * Zod enum over every known board coordinate.
 * Used at parse boundaries when a value must be some coordinate, independent
 * of which board size is in play.
 */
export const coordinateSchema: z.ZodType<Coordinate> = _coordinateSchemaObject;

const _assertExactCoordinate: AssertExact<Coordinate, CoordinateSchemaType> =
  true;
