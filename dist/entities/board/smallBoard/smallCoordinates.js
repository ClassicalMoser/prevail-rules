import { smallBoardColumnNumbers } from "./smallColumnNumbers.js";
import { smallBoardRowLetters } from "./smallRowLetters.js";
/**
 * An iterable array of all valid coordinates on a small board (A-1 through H-12), generated from row letters and column numbers.
 *
 * Runtime validation ensures all coordinates match the SmallBoardCoordinate type pattern.
 */
const computedCoordinates = smallBoardRowLetters.flatMap((row) => smallBoardColumnNumbers.map((column) => `${row}-${column}`));
export const smallBoardCoordinates = computedCoordinates;
