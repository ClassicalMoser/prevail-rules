/**
 * Cartesian product of standard row letters × column numbers (`"A-1"` … `"L-18"`).
 *
 * Same role as the small/large coordinate modules: closed list for Zod and for
 * the shared {@link Coordinate} union. See {@link smallBoardCoordinates}.
 */

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
    standardBoardColumnNumbers.map(
      (column): StandardBoardCoordinate => `${row}-${column}`,
    ),
  );

const _standardBoardCoordinatesSchemaObject = z.enum(standardBoardCoordinates);

/** Zod enum over {@link standardBoardCoordinates}. */
export const standardBoardCoordinateSchema: z.ZodType<StandardBoardCoordinate> =
  _standardBoardCoordinatesSchemaObject;
