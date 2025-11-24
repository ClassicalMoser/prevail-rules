import type { AssertExact } from "../../../utils/assertExact.js";
import type { BoardSpace } from "../boardSpace.js";
import type { StandardBoardCoordinate } from "./standardCoordinates.js";
import { z } from "zod";
import { boardSpaceSchema } from "../boardSpace.js";
import { standardBoardCoordinatesSchema } from "./standardCoordinates.js";

/**
 * The schema for a standard board.
 */
export const standardBoardSchema = z.record(
  standardBoardCoordinatesSchema,
  boardSpaceSchema
);

type StandardBoardSchemaType = z.infer<typeof standardBoardSchema>;

/**
 * A standard board for the game.
 * A unique map of exactly 216 coordinates (A1 through L18), where each coordinate
 * exists exactly once (e.g., there is only one "A11", only one "F3", etc.).
 *
 * Coordinate system:
 * - Rows are lettered A through L (12 rows)
 * - Columns are numbered 1 through 18 (1-indexed)
 * - Example: "A1" is the top-left space, "L18" is the bottom-right space
 *
 * Access spaces by coordinate: `board["A1"]`, `board["F3"]`, etc.
 */
export type StandardBoard = {
  [K in StandardBoardCoordinate]: BoardSpace;
};

const _assertExactStandardBoard: AssertExact<
  StandardBoardSchemaType,
  StandardBoardSchemaType
> = true;
