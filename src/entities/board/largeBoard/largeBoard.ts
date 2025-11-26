import type { AssertExact } from "../../../utils/assertExact.js";
import type { BoardSpace } from "../boardSpace.js";
import type { LargeBoardCoordinate } from "./largeCoordinates.js";
import { z } from "zod";
import { boardSpaceSchema } from "../boardSpace.js";
import { largeBoardCoordinates } from "./largeCoordinates.js";

/**
 * Creates a Zod object schema for a board with all required coordinates.
 *
 * This builds a schema where each coordinate is a required key mapping to a BoardSpace.
 * By using z.object() with explicit keys (instead of z.record()), TypeScript can infer
 * the exact coordinate types rather than falling back to Record<string, BoardSpace>.
 *
 * @param coordinates - Array of coordinate strings (e.g., ["A-1", "A-2", ...])
 * @returns A ZodObject schema that validates an object with all coordinates as required keys
 *
 * The return type explicitly specifies:
 * - Shape: Record<T, typeof boardSpaceSchema> - each coordinate maps to boardSpaceSchema
 * - Unknown keys: "strip" - extra keys are removed during parsing
 * - Output/Input: Record<T, BoardSpace> - TypeScript infers the exact coordinate type
 */
function createBoardSchema<T extends string>(
  coordinates: readonly T[]
): z.ZodObject<
  Record<T, typeof boardSpaceSchema>,
  "strip",
  z.ZodTypeAny,
  Record<T, BoardSpace>,
  Record<T, BoardSpace>
> {
  const shape = {} as Record<T, typeof boardSpaceSchema>;
  // Ensure all coordinates are included in the schema
  for (const coord of coordinates) {
    shape[coord] = boardSpaceSchema;
  }
  // Return the schema with explicit types
  return z.object(shape) as z.ZodObject<
    Record<T, typeof boardSpaceSchema>,
    "strip",
    z.ZodTypeAny,
    Record<T, BoardSpace>,
    Record<T, BoardSpace>
  >;
}

/**
 * The schema for a large board.
 */
export const largeBoardSchema = z.object({
  boardType: z.literal("large"),
  board: createBoardSchema(largeBoardCoordinates),
});

type LargeBoardSchemaType = z.infer<typeof largeBoardSchema>;

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
