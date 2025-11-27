import { largeBoardColumnNumbers } from "./largeColumnNumbers.js";
import { largeBoardRowLetters } from "./largeRowLetters.js";
/**
 * An iterable array of all valid coordinates on a large board (A-1 through X-36), generated from row letters and column numbers.
 *
 * Runtime validation ensures all coordinates match the LargeBoardCoordinate type pattern.
 */
const computedCoordinates = largeBoardRowLetters.flatMap((row) => largeBoardColumnNumbers.map((column) => `${row}-${column}`));
export const largeBoardCoordinates = computedCoordinates;
