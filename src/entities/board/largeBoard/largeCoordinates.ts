import type { LargeBoardColumnNumber, LargeBoardRowLetter } from "@entities";
import { largeBoardColumnNumbers } from "./largeColumnNumbers";
import { largeBoardRowLetters } from "./largeRowLetters";

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
