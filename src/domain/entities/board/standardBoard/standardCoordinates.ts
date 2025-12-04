import type { StandardBoardColumnNumber } from './standardColumnNumbers';
import type { StandardBoardRowLetter } from './standardRowLetters';
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
const computedCoordinates = standardBoardRowLetters.flatMap((row) =>
  standardBoardColumnNumbers.map((column) => `${row}-${column}`),
);

export const standardBoardCoordinates =
  computedCoordinates as readonly StandardBoardCoordinate[];
