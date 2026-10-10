/**
 * Cartesian product of large row letters × column numbers (`"A-1"` … `"X-36"`).
 *
 * Widest closed list; extensionally equal to the shared {@link Coordinate}
 * union. See {@link smallBoardCoordinates}.
 */

import type { AssertExact } from '@utils';
import type { LargeBoardColumnNumber } from './largeColumnNumbers';

import type { LargeBoardRowLetter } from './largeRowLetters';
import { z } from 'zod';
import { largeBoardColumnNumbers } from './largeColumnNumbers';
import { largeBoardRowLetters } from './largeRowLetters';

/** A coordinate that exists on a large board. */
export type LargeBoardCoordinate =
  `${LargeBoardRowLetter}-${LargeBoardColumnNumber}`;

const computedCoordinates = largeBoardRowLetters.flatMap((row) =>
  largeBoardColumnNumbers.map((column) => `${row}-${column}`),
);

/** Every large-board coordinate, in row-major order from the letter/number lists. */
export const largeBoardCoordinates =
  computedCoordinates as readonly LargeBoardCoordinate[]; // Intentionally safe: same consts as the template type.

const _largeBoardCoordinatesSchemaObject = z.enum(largeBoardCoordinates);

type LargeBoardCoordinatesSchemaType = z.infer<
  typeof _largeBoardCoordinatesSchemaObject
>;

/** Zod enum over {@link largeBoardCoordinates}. */
export const largeBoardCoordinateSchema: z.ZodType<LargeBoardCoordinate> =
  _largeBoardCoordinatesSchemaObject;

const _assertExactLargeBoardCoordinates: AssertExact<
  LargeBoardCoordinate,
  LargeBoardCoordinatesSchemaType
> = true;
