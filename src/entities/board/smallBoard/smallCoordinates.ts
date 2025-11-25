import type { AssertExact } from "../../../utils/assertExact.js";
import type { SmallBoardColumnNumber } from "./smallColumnNumbers.js";
import type { SmallBoardRowLetter } from "./smallRowLetters.js";

import { z } from "zod";
import { smallBoardColumnNumbers } from "./smallColumnNumbers.js";
import { smallBoardRowLetters } from "./smallRowLetters.js";

/**
 * A valid coordinate on a small board (A-1 through H-12).
 */
export type SmallBoardCoordinate =
  `${SmallBoardRowLetter}-${SmallBoardColumnNumber}`;

/**
 * An iterable array of all valid coordinates on a small board (A-1 through H-12), generated from row letters and column numbers.
 *
 * Runtime validation ensures all coordinates match the StandardBoardCoordinate type pattern.
 */
const _computedCoordinates = smallBoardRowLetters.flatMap((row) =>
  smallBoardColumnNumbers.map((column) => `${row}-${column}`),
);

export const smallBoardCoordinates =
  _computedCoordinates as readonly SmallBoardCoordinate[];

/**
 * The schema for a valid coordinate on a small board (A-1 through H-12).
 */
export const smallBoardCoordinatesSchema = z.enum(
  smallBoardCoordinates as readonly [
    SmallBoardCoordinate,
    ...SmallBoardCoordinate[],
  ],
);

// Helper type to check match of type against schema
type smallBoardCoordinatesSchemaType = z.infer<
  typeof smallBoardCoordinatesSchema
>;

// assert that the type matches the schema
const _smallBoardCoordinatesAssertExact: AssertExact<
  smallBoardCoordinatesSchemaType,
  SmallBoardCoordinate
> = true;
