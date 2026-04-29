import type { AssertExact } from "@utils";
import type { LargeBoardColumnNumber } from "./largeColumnNumbers";

import type { LargeBoardRowLetter } from "./largeRowLetters";
import { z } from "zod";
import { largeBoardColumnNumbers } from "./largeColumnNumbers";
import { largeBoardRowLetters } from "./largeRowLetters";

/**
 * A valid coordinate on a large board (A-1 through X-36).
 */
export type LargeBoardCoordinate = `${LargeBoardRowLetter}-${LargeBoardColumnNumber}`;

/**
 * An iterable array of all valid coordinates on a large board (A-1 through X-36), generated from row letters and column numbers.
 *
 * Runtime validation ensures all coordinates match the LargeBoardCoordinate type pattern.
 */
const computedCoordinates = largeBoardRowLetters.flatMap((row) =>
  largeBoardColumnNumbers.map((column) => `${row}-${column}`),
);

export const largeBoardCoordinates = computedCoordinates as readonly LargeBoardCoordinate[]; // This cast is safe.

const _largeBoardCoordinatesSchema = z.enum(largeBoardCoordinates);
type LargeBoardCoordinatesSchemaType = z.infer<typeof _largeBoardCoordinatesSchema>;

const _assertExactLargeBoardCoordinates: AssertExact<
  LargeBoardCoordinate,
  LargeBoardCoordinatesSchemaType
> = true;

/**
 * The schema for a large board coordinate.
 */
export const largeBoardCoordinateSchema: z.ZodType<LargeBoardCoordinate> =
  _largeBoardCoordinatesSchema;
