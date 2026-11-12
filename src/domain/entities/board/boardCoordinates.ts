/**
 * Shared {@link Coordinate} vocabulary for every board size.
 *
 * Per-size products live under `smallBoard/` / `standardBoard/` / `largeBoard/`.
 * This module unions them into one type, one list, and one Zod enum.
 *
 * Nesting: small ⊂ standard ⊂ large, so the union is extensionally the large
 * product. Types do **not** brand a coordinate with board size — size is a
 * value on {@link Board.boardType} / the layout instance. Membership for a
 * given board is checked by `refineBoardLayout` in `@legality` and by layout
 * index lookups returning `-1` for out-of-range parts.
 */

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
 * Declared as a union of the three size products for documentation. Because
 * the sets nest, this is the same set of strings as
 * {@link LargeBoardCoordinate}.
 */
export type Coordinate =
  | StandardBoardCoordinate
  | SmallBoardCoordinate
  | LargeBoardCoordinate;

/**
 * Every space on some board, once each.
 * Order is not contract; the Set removes the overlapping small/standard
 * entries when spreading all three products.
 */
export const allCoordinates: readonly Coordinate[] = [
  ...new Set<Coordinate>([
    ...standardBoardCoordinates,
    ...smallBoardCoordinates,
    ...largeBoardCoordinates,
  ]),
];

const _coordinateSchemaObject = z.enum(allCoordinates);

/**
 * Zod enum over every known board coordinate.
 * Used at parse boundaries when a value must be some coordinate, independent
 * of which board size is in play.
 */
export const coordinateSchema: z.ZodType<Coordinate> = _coordinateSchemaObject;
