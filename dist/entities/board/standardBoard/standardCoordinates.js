import { standardBoardColumnNumbers } from "./standardColumnNumbers.js";
import { standardBoardRowLetters } from "./standardRowLetters.js";
/**
 * An iterable array of all valid coordinates on a standard board (A-1 through L-18), generated from row letters and column numbers.
 *
 * Runtime validation ensures all coordinates match the StandardBoardCoordinate type pattern.
 */
const computedCoordinates = standardBoardRowLetters.flatMap((row) => standardBoardColumnNumbers.map((column) => `${row}-${column}`));
export const standardBoardCoordinates = computedCoordinates;
