import { z } from "zod";
import { largeBoardColumnNumbers } from "./largeColumnNumbers.js";
import { largeBoardRowLetters } from "./largeRowLetters.js";
/**
 * An iterable array of all valid coordinates on a large board (A-1 through X-36), generated from row letters and column numbers.
 *
 * Runtime validation ensures all coordinates match the LargeBoardCoordinate type pattern.
 */
const _computedCoordinates = largeBoardRowLetters.flatMap((row) => largeBoardColumnNumbers.map((column) => `${row}-${column}`));
export const largeBoardCoordinates = _computedCoordinates;
/**
 * The schema for a valid coordinate on a large board (A-1 through X-36).
 */
export const largeBoardCoordinatesSchema = z.enum(largeBoardCoordinates);
// assert that the type matches the schema
const _largeBoardCoordinatesAssertExact = true;
