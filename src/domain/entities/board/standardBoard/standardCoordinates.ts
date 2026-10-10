/**
 * Cartesian product of standard row letters × column numbers (`"A-1"` … `"L-18"`).
 *
 * Same role as the small/large coordinate modules: closed list for Zod and for
 * the shared {@link Coordinate} union. See {@link smallBoardCoordinates}.
 */

import type { AssertExact } from '@utils';
import type { StandardBoardColumnNumber } from './standardColumnNumbers';
import type { StandardBoardRowLetter } from './standardRowLetters';

import { z } from 'zod';
import { standardBoardColumnNumbers } from './standardColumnNumbers';
import { standardBoardRowLetters } from './standardRowLetters';

/** A coordinate that exists on a standard board. */
export type StandardBoardCoordinate =
  `${StandardBoardRowLetter}-${StandardBoardColumnNumber}`;

/** Every standard-board coordinate, in row-major order from the letter/number lists. */
export const standardBoardCoordinates: readonly StandardBoardCoordinate[] =
  standardBoardRowLetters.flatMap((row) =>
    standardBoardColumnNumbers.map((column) => `${row}-${column}`),
  ) as readonly StandardBoardCoordinate[]; // Intentionally safe: same consts as the template type.

const _standardBoardCoordinatesSchemaObject = z.enum(standardBoardCoordinates);

type StandardBoardCoordinatesSchemaType = z.infer<
  typeof _standardBoardCoordinatesSchemaObject
>;

/** Zod enum over {@link standardBoardCoordinates}. */
export const standardBoardCoordinateSchema: z.ZodType<StandardBoardCoordinate> =
  _standardBoardCoordinatesSchemaObject;

const _assertExactStandardBoardCoordinates: AssertExact<
  StandardBoardCoordinate,
  StandardBoardCoordinatesSchemaType
> = true;
