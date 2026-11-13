/**
 * Cartesian product of small row letters × column numbers.
 *
 * Builds the closed list of `"A-1"` … `"H-12"` strings used for Zod enums and
 * for feeding the shared {@link Coordinate} union. The template type
 * {@link SmallBoardCoordinate} matches that product. Each computed string is
 * typed as that template as it is built, so the compiler checks it against the
 * same letter and number lists the type is made from; no assertion is needed.
 */

import type { SmallBoardColumnNumber } from './smallColumnNumbers';

import type { SmallBoardRowLetter } from './smallRowLetters';
import { z } from 'zod';
import { smallBoardColumnNumbers } from './smallColumnNumbers';
import { smallBoardRowLetters } from './smallRowLetters';

/** A coordinate that exists on a small board. */
export type SmallBoardCoordinate =
  `${SmallBoardRowLetter}-${SmallBoardColumnNumber}`;

const computedCoordinates: readonly SmallBoardCoordinate[] =
  smallBoardRowLetters.flatMap((row) =>
    smallBoardColumnNumbers.map(
      (column): SmallBoardCoordinate => `${row}-${column}`,
    ),
  );

/** Every small-board coordinate, in row-major order from the letter/number lists. */
export const smallBoardCoordinates: readonly SmallBoardCoordinate[] =
  computedCoordinates;

const _smallBoardCoordinatesSchemaObject = z.enum(smallBoardCoordinates);

/** Zod enum over {@link smallBoardCoordinates}. */
export const smallBoardCoordinateSchema: z.ZodType<SmallBoardCoordinate> =
  _smallBoardCoordinatesSchemaObject;

// NOTE: No AssertExact in this case becuase it would be strictly tautological.
