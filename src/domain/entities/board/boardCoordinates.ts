import type { Board } from './board';
import type { StandardBoardCoordinate } from './standardBoard';
import type { SmallBoardCoordinate } from './smallBoard';
import type { LargeBoardCoordinate } from './largeBoard';

import { standardBoardCoordinates } from './standardBoard';
import { smallBoardCoordinates } from './smallBoard';
import { largeBoardCoordinates } from './largeBoard';

import { z } from 'zod';
import type { AssertExact } from '@utils';

/**
 * All valid board coordinates across all board sizes.
 *
 * Coordinate sets are nested (small ⊂ standard ⊂ large), so the union is
 * extensionally equal to {@link LargeBoardCoordinate}. Types no longer express
 * which board size a coordinate belongs to — that is enforced at Zod boundaries
 * and by runtime bounds checks.
 */
export type Coordinate =
  | StandardBoardCoordinate
  | SmallBoardCoordinate
  | LargeBoardCoordinate;

/**
 * @deprecated Use Coordinate instead. Board type is state, not type.
 */
export type BoardCoordinate<_T extends Board = Board> = Coordinate;

const allCoordinates = [
  ...new Set<Coordinate>([
    ...standardBoardCoordinates,
    ...smallBoardCoordinates,
    ...largeBoardCoordinates,
  ]),
];

/**
 * Schema for any board coordinate
 */
export const coordinateSchema: z.ZodType<Coordinate> = z.enum(allCoordinates);

const _assertExactCoordinate: AssertExact<
  Coordinate,
  z.infer<typeof coordinateSchema>
> = true;
