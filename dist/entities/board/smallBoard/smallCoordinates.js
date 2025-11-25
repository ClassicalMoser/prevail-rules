import { z } from "zod";
import { smallBoardColumnNumbers } from "./smallColumnNumbers.js";
import { smallBoardRowLetters } from "./smallRowLetters.js";
/**
 * An iterable array of all valid coordinates on a small board (A-1 through H-12), generated from row letters and column numbers.
 *
 * Runtime validation ensures all coordinates match the StandardBoardCoordinate type pattern.
 */
const _computedCoordinates = smallBoardRowLetters.flatMap((row) => smallBoardColumnNumbers.map((column) => `${row}-${column}`));
export const smallBoardCoordinates = _computedCoordinates;
/**
 * The schema for a valid coordinate on a small board (A-1 through H-12).
 */
export const smallBoardCoordinatesSchema = z.enum(smallBoardCoordinates);
// assert that the type matches the schema
const _smallBoardCoordinatesAssertExact = true;
