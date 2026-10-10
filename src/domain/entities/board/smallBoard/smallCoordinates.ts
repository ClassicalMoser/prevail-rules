/**
 * Cartesian product of small row letters × column numbers.
 *
 * Builds the closed list of `"A-1"` … `"H-12"` strings used for Zod enums and
 * for feeding the shared {@link Coordinate} union. The template type
 * {@link SmallBoardCoordinate} matches that product; the `as const` array cast
 * after `flatMap` is the usual TS gap between computed strings and the
 * template union (safe because both sides use the same letter/number consts).
 */

import type { AssertExact } from '@utils';
import type { SmallBoardColumnNumber } from './smallColumnNumbers';

import type { SmallBoardRowLetter } from './smallRowLetters';
import { z } from 'zod';
import { smallBoardColumnNumbers } from './smallColumnNumbers';
import { smallBoardRowLetters } from './smallRowLetters';

/** A coordinate that exists on a small board. */
export type SmallBoardCoordinate =
  `${SmallBoardRowLetter}-${SmallBoardColumnNumber}`;

const computedCoordinates = smallBoardRowLetters.flatMap((row) =>
  smallBoardColumnNumbers.map((column) => `${row}-${column}`),
);

/** Every small-board coordinate, in row-major order from the letter/number lists. */
export const smallBoardCoordinates =
  computedCoordinates as readonly SmallBoardCoordinate[]; // Intentionally safe: same consts as the template type.

const _smallBoardCoordinatesSchemaObject = z.enum(smallBoardCoordinates);

type SmallBoardCoordinatesSchemaType = z.infer<
  typeof _smallBoardCoordinatesSchemaObject
>;

/** Zod enum over {@link smallBoardCoordinates}. */
export const smallBoardCoordinateSchema: z.ZodType<SmallBoardCoordinate> =
  _smallBoardCoordinatesSchemaObject;

const _assertExactSmallBoardCoordinates: AssertExact<
  SmallBoardCoordinate,
  SmallBoardCoordinatesSchemaType
> = true;
