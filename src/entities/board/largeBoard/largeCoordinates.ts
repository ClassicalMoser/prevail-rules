import type { LargeBoardColumnNumber } from "@entities/board/largeBoard/largeColumnNumbers.js";
import type { LargeBoardRowLetter } from "@entities/board/largeBoard/largeRowLetters.js";
import { largeBoardColumnNumbers } from "@entities/board/largeBoard/largeColumnNumbers.js";
import { largeBoardRowLetters } from "@entities/board/largeBoard/largeRowLetters.js";

/**
 * A valid coordinate on a large board (A-1 through X-36).
 */
export type LargeBoardCoordinate =
  `${LargeBoardRowLetter}-${LargeBoardColumnNumber}`;

/**
 * An iterable array of all valid coordinates on a large board (A-1 through X-36), generated from row letters and column numbers.
 *
 * Runtime validation ensures all coordinates match the LargeBoardCoordinate type pattern.
 */
const computedCoordinates = largeBoardRowLetters.flatMap((row) =>
  largeBoardColumnNumbers.map((column) => `${row}-${column}`),
);

export const largeBoardCoordinates =
  computedCoordinates as readonly LargeBoardCoordinate[];
