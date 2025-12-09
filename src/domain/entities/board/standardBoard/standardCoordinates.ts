import type { AssertExact } from '@utils';
import type { StandardBoardColumnNumber } from './standardColumnNumbers';
import type { StandardBoardRowLetter } from './standardRowLetters';

import { z } from 'zod';
import { standardBoardColumnNumbers } from './standardColumnNumbers';
import { standardBoardRowLetters } from './standardRowLetters';

/**
 * A valid coordinate on a standard board (A-1 through L-18).
 */
export type StandardBoardCoordinate =
  `${StandardBoardRowLetter}-${StandardBoardColumnNumber}`;

/**
 * An iterable array of all valid coordinates on a standard board (A-1 through L-18), generated from row letters and column numbers.
 *
 * Runtime validation ensures all coordinates match the StandardBoardCoordinate type pattern.
 */
export const standardBoardCoordinates: readonly StandardBoardCoordinate[] =
  standardBoardRowLetters.flatMap((row) =>
    standardBoardColumnNumbers.map((column) => `${row}-${column}`),
  ) as readonly StandardBoardCoordinate[];

const _standardBoardCoordinatesSchema = z.enum(standardBoardCoordinates);
type StandardBoardCoordinatesSchemaType = z.infer<
  typeof _standardBoardCoordinatesSchema
>;

const _assertExactStandardBoardCoordinates: AssertExact<
  StandardBoardCoordinate,
  StandardBoardCoordinatesSchemaType
> = true;

/**
 * The schema for a standard board coordinate.
 */
export const standardBoardCoordinateSchema: z.ZodType<StandardBoardCoordinate> =
  _standardBoardCoordinatesSchema;
