import type { AssertExact } from "@utils";
import type { SmallBoardColumnNumber } from "./smallColumnNumbers";

import type { SmallBoardRowLetter } from "./smallRowLetters";
import { z } from "zod";
import { smallBoardColumnNumbers } from "./smallColumnNumbers";
import { smallBoardRowLetters } from "./smallRowLetters";

/**
 * A valid coordinate on a small board (A-1 through H-12).
 */
export type SmallBoardCoordinate = `${SmallBoardRowLetter}-${SmallBoardColumnNumber}`;

/**
 * An iterable array of all valid coordinates on a small board (A-1 through H-12), generated from row letters and column numbers.
 *
 * Runtime validation ensures all coordinates match the SmallBoardCoordinate type pattern.
 */
const computedCoordinates = smallBoardRowLetters.flatMap((row) =>
  smallBoardColumnNumbers.map((column) => `${row}-${column}`),
);

export const smallBoardCoordinates = computedCoordinates as readonly SmallBoardCoordinate[]; // This cast is safe.

const _smallBoardCoordinatesSchema = z.enum(smallBoardCoordinates);
type SmallBoardCoordinatesSchemaType = z.infer<typeof _smallBoardCoordinatesSchema>;

const _assertExactSmallBoardCoordinates: AssertExact<
  SmallBoardCoordinate,
  SmallBoardCoordinatesSchemaType
> = true;

/**
 * The schema for a small board coordinate.
 */
export const smallBoardCoordinateSchema: z.ZodType<SmallBoardCoordinate> =
  _smallBoardCoordinatesSchema;
