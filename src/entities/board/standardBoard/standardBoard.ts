import type { AssertExact } from "../../../assertExact.js";
import type { BoardSpace } from "../boardSpace.js";
import type { BoardCoordinate } from "./coordinates.js";
import { z } from "zod";
import { boardSpaceSchema } from "../boardSpace.js";
import { boardCoordinatesSchema } from "./coordinates.js";

/**
 * The schema for a standard board.
 */
export const standardBoardSchema = z.record(
  boardCoordinatesSchema,
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
  [K in BoardCoordinate]: BoardSpace;
};

const _assertExactStandardBoard: AssertExact<
  StandardBoard,
  StandardBoardSchemaType
> = true;
