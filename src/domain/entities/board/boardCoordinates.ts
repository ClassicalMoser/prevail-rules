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
 * All valid board coordinates across all board sizes.
 *
 * Coordinate sets are nested (small ⊂ standard ⊂ large), so the union is
 * extensionally equal to {@link LargeBoardCoordinate}. Types no longer express
 * which board size a coordinate belongs to. That is enforced at Zod boundaries
 * and by runtime bounds checks.
 */
export type Coordinate =
  | StandardBoardCoordinate
  | SmallBoardCoordinate
  | LargeBoardCoordinate;

const allCoordinates = [
  ...new Set<Coordinate>([
    ...standardBoardCoordinates,
    ...smallBoardCoordinates,
    ...largeBoardCoordinates,
  ]),
];

/** O(1) lookup so joined row/column strings narrow to {@link Coordinate} without a cast. */
const coordinateByKey = new Map<string, Coordinate>(
  allCoordinates.map((coordinate) => [coordinate, coordinate]),
);

/**
 * Join a row letter and column number into a {@link Coordinate}.
 * Layout modules only — not part of the public `@entities` surface.
 * Size membership is a value concern: layouts pass parts from their own arrays.
 *
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
 * Schema for any board coordinate
 */
export const coordinateSchema: z.ZodType<Coordinate> = _coordinateSchemaObject;

const _assertExactCoordinate: AssertExact<Coordinate, CoordinateSchemaType> =
  true;
