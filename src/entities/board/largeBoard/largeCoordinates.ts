import type { AssertExact } from "../../../utils/assertExact.js";
import type { LargeBoardColumnNumber } from "./largeColumnNumbers.js";
import type { LargeBoardRowLetter } from "./largeRowLetters.js";

import { z } from "zod";
import { largeBoardColumnNumbers } from "./largeColumnNumbers.js";
import { largeBoardRowLetters } from "./largeRowLetters.js";

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
const _computedCoordinates = largeBoardRowLetters.flatMap((row) =>
  largeBoardColumnNumbers.map((column) => `${row}-${column}`),
);

export const largeBoardCoordinates =
  _computedCoordinates as readonly LargeBoardCoordinate[];

/**
 * The schema for a valid coordinate on a large board (A-1 through X-36).
 */
export const largeBoardCoordinatesSchema = z.enum(
  largeBoardCoordinates as readonly [
    LargeBoardCoordinate,
    ...LargeBoardCoordinate[],
  ],
);

// Helper type to check match of type against schema
type largeBoardCoordinatesSchemaType = z.infer<
  typeof largeBoardCoordinatesSchema
>;

// assert that the type matches the schema
const _largeBoardCoordinatesAssertExact: AssertExact<
  largeBoardCoordinatesSchemaType,
  LargeBoardCoordinate
> = true;
