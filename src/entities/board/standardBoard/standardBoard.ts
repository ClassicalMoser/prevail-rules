import type { AssertExact } from "../../../utils/assertExact.js";
import type { BoardSpace } from "../boardSpace.js";
import type { StandardBoardCoordinate } from "./standardCoordinates.js";
import { z } from "zod";
import { boardSpaceSchema } from "../boardSpace.js";
import { standardBoardCoordinatesSchema } from "./standardCoordinates.js";

/**
 * The schema for a standard board.
 */
export const standardBoardSchema = z.object({
  boardType: z.literal("standard"),
  board: z.record(standardBoardCoordinatesSchema, boardSpaceSchema),
});

type StandardBoardSchemaType = z.infer<typeof standardBoardSchema> & {
  board: Record<StandardBoardCoordinate, BoardSpace>;
};

/**
 * A standard board for the game.
 * A unique map of exactly 216 coordinates (A-1 through L-18), where each coordinate
 * exists exactly once (e.g., there is only one "A-11", only one "F-3", etc.).
 *
 * Coordinate system:
 * - Rows are lettered A through L (12 rows)
 * - Columns are numbered 1 through 18 (1-indexed)
 * - Example: "A-1" is the top-left space, "L-18" is the bottom-right space
 *
 * Access spaces by coordinate: `board["A-1"]`, `board["F-3"]`, etc.
 */
export interface StandardBoard {
  /**
   * The type of board.
   */
  boardType: "standard";
  /**
   * The board.
   */
  board: Record<StandardBoardCoordinate, BoardSpace>;
}

const _assertExactStandardBoard: AssertExact<
  StandardBoard,
  StandardBoardSchemaType
> = true;
