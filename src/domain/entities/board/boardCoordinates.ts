import type { AssertExact } from '@utils';
import type { StandardBoardCoordinate } from './standardBoard';
import type { SmallBoardCoordinate } from './smallBoard';
import type { LargeBoardCoordinate } from './largeBoard';

import { standardBoardCoordinates } from './standardBoard';
import { smallBoardCoordinates } from './smallBoard';
import { largeBoardCoordinates } from './largeBoard';

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

const _coordinateSchemaObject = z.enum(allCoordinates);

type CoordinateSchemaType = z.infer<typeof _coordinateSchemaObject>;

/**
 * Schema for any board coordinate
 */
export const coordinateSchema: z.ZodType<Coordinate> = _coordinateSchemaObject;

const _assertExactCoordinate: AssertExact<Coordinate, CoordinateSchemaType> =
  true;
