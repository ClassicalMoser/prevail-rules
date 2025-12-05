import type { BoardSpace, SmallBoardCoordinate } from '@entities';
import type { AssertExact } from '@utils';
import { boardSpaceSchema, SMALL_BOARD_TYPE } from '@entities';
import { z } from 'zod';
import { smallBoardCoordinates } from './smallCoordinates';

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
 * - Shape: Record<T, z.ZodType<BoardSpace>> - each coordinate maps to a BoardSpace schema
 * - Unknown keys: "strip" - extra keys are removed during parsing
 * - Output/Input: Record<T, BoardSpace> - TypeScript infers the exact coordinate type
 */
function createBoardSchema<T extends string>(
  coordinates: readonly T[],
): z.ZodObject<Record<T, z.ZodType<BoardSpace>>> {
  const shape = {} as Record<T, z.ZodType<BoardSpace>>;
  // Ensure all coordinates are included in the schema
  for (const coord of coordinates) {
    shape[coord] = boardSpaceSchema;
  }
  // Return the schema - TypeScript will infer the correct types
  return z.object(shape);
}

/**
 * The schema for the board coordinate map.
 */
const smallBoardCoordinateMapSchema: z.ZodObject<
  Record<SmallBoardCoordinate, z.ZodType<BoardSpace>>
> = createBoardSchema(smallBoardCoordinates);

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
  boardType: typeof SMALL_BOARD_TYPE;
  /**
   * The board.
   */
  board: Record<SmallBoardCoordinate, BoardSpace>;
}

const _smallBoardSchemaObject = z.object({
  boardType: z.literal(SMALL_BOARD_TYPE),
  board: smallBoardCoordinateMapSchema,
});

type SmallBoardSchemaType = z.infer<typeof _smallBoardSchemaObject>;

/**
 * The schema for a small board.
 */
export const smallBoardSchema: z.ZodObject<{
  boardType: z.ZodLiteral<'small'>;
  board: typeof smallBoardCoordinateMapSchema;
}> = _smallBoardSchemaObject;

// Verify manual type matches schema inference
const _assertExactSmallBoard: AssertExact<SmallBoard, SmallBoardSchemaType> =
  true;
