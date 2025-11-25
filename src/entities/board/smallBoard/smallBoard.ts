import type { AssertExact } from "../../../utils/assertExact.js";
import type { BoardSpace } from "../boardSpace.js";
import type { SmallBoardCoordinate } from "./smallCoordinates.js";
import { z } from "zod";
import { boardSpaceSchema } from "../boardSpace.js";
import { smallBoardCoordinatesSchema } from "./smallCoordinates.js";

/**
 * The schema for a small board.
 */
export const smallBoardSchema = z.object({
  boardType: z.literal("small"),
  board: z.record(smallBoardCoordinatesSchema, boardSpaceSchema),
});

type SmallBoardSchemaType = z.infer<typeof smallBoardSchema> & {
  board: Record<SmallBoardCoordinate, BoardSpace>;
};

/**
 * A small board for the game.
 * A unique map of exactly 96 coordinates (A-1 through H-12), where each coordinate
 * exists exactly once (e.g., there is only one "A-11", only one "F-3", etc.).
 *
 * Coordinate system:
 * - Rows are lettered A through H (8 rows)
 * - Columns are numbered 1 through 12 (1-indexed)
 * - Example: "A-1" is the top-left space, "H-12" is the bottom-right space
 *
 * Access spaces by coordinate: `board["A-1"]`, `board["F-3"]`, etc.
 */
export interface SmallBoard {
  /**
   * The type of board.
   */
  boardType: "small";
  /**
   * The board.
   */
  board: Record<SmallBoardCoordinate, BoardSpace>;
}

const _assertExactSmallBoard: AssertExact<SmallBoard, SmallBoardSchemaType> =
  true;
