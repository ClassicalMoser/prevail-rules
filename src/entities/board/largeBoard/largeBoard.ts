import type { AssertExact } from "../../../utils/assertExact.js";
import type { BoardSpace } from "../boardSpace.js";
import type { LargeBoardCoordinate } from "./largeCoordinates.js";
import { z } from "zod";
import { boardSpaceSchema } from "../boardSpace.js";
import { largeBoardCoordinatesSchema } from "./largeCoordinates.js";

/**
 * The schema for a large board.
 */
export const largeBoardSchema = z.object({
  boardType: z.literal("large"),
  board: z.record(largeBoardCoordinatesSchema, boardSpaceSchema),
});

type LargeBoardSchemaType = z.infer<typeof largeBoardSchema> & {
  board: Record<LargeBoardCoordinate, BoardSpace>;
};

/**
 * A large board for the game.
 * A unique map of exactly 864 coordinates (A-1 through X-36), where each coordinate
 * exists exactly once (e.g., there is only one "A-11", only one "F-3", etc.).
 *
 * Coordinate system:
 * - Rows are lettered A through X (24 rows)
 * - Columns are numbered 1 through 36 (1-indexed)
 * - Example: "A-1" is the top-left space, "X-36" is the bottom-right space
 *
 * Access spaces by coordinate: `board["A-1"]`, `board["F-3"]`, etc.
 */
export interface LargeBoard {
  /**
   * The type of board.
   */
  boardType: "large";
  /**
   * The board.
   */
  board: Record<LargeBoardCoordinate, BoardSpace>;
}

const _assertExactLargeBoard: AssertExact<LargeBoard, LargeBoardSchemaType> =
  true;
