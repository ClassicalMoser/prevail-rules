import { z } from "zod";
import { standardBoardColumnNumbers } from "./standardColumnNumbers.js";
import { standardBoardRowLetters } from "./standardRowLetters.js";
/**
 * An iterable array of all valid coordinates on a standard board (A1 through L18), generated from row letters and column numbers.
 *
 * Runtime validation ensures all coordinates match the StandardBoardCoordinate type pattern.
 */
const _computedCoordinates = standardBoardRowLetters.flatMap((row) => standardBoardColumnNumbers.map((column) => `${row}${column}`));
export const standardBoardCoordinates = _computedCoordinates;
/**
 * The schema for a valid coordinate on a standard board (A1 through L18).
 */
export const standardBoardCoordinatesSchema = z.enum(standardBoardCoordinates);
// assert that the type matches the schema
const _boardCoordinatesAssertExact = true;
