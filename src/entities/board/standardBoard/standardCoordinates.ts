import type { AssertExact } from "../../../utils/assertExact.js";
import type { StandardBoardColumnNumber } from "./standardColumnNumbers.js";
import type { StandardBoardRowLetter } from "./standardRowLetters.js";

import { z } from "zod";
import { standardBoardColumnNumbers } from "./standardColumnNumbers.js";
import { standardBoardRowLetters } from "./standardRowLetters.js";

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
const _computedCoordinates = standardBoardRowLetters.flatMap((row) =>
  standardBoardColumnNumbers.map((column) => `${row}-${column}`),
);

export const standardBoardCoordinates =
  _computedCoordinates as readonly StandardBoardCoordinate[];

/**
 * The schema for a valid coordinate on a standard board (A-1 through L-18).
 */
export const standardBoardCoordinatesSchema = z.enum(
  standardBoardCoordinates as readonly [
    StandardBoardCoordinate,
    ...StandardBoardCoordinate[],
  ],
);

// Helper type to check match of type against schema
type standardBoardCoordinatesSchemaType = z.infer<
  typeof standardBoardCoordinatesSchema
>;

// assert that the type matches the schema
const _boardCoordinatesAssertExact: AssertExact<
  standardBoardCoordinatesSchemaType,
  StandardBoardCoordinate
> = true;
