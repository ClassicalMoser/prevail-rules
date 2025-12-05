import type { BoardSpace, LargeBoardCoordinate } from '@entities';
import type { AssertExact } from '@utils';
import { boardSpaceSchema, LARGE_BOARD_TYPE } from '@entities';
import { z } from 'zod';
import { largeBoardCoordinates } from './largeCoordinates';

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
const largeBoardCoordinateMapSchema: z.ZodObject<
  Record<LargeBoardCoordinate, z.ZodType<BoardSpace>>
> = createBoardSchema(largeBoardCoordinates);

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
  boardType: typeof LARGE_BOARD_TYPE;
  /**
   * The board.
   */
  board: Record<LargeBoardCoordinate, BoardSpace>;
}

const _largeBoardSchemaObject = z.object({
  boardType: z.literal(LARGE_BOARD_TYPE),
  board: largeBoardCoordinateMapSchema,
});

type LargeBoardSchemaType = z.infer<typeof _largeBoardSchemaObject>;

/**
 * The schema for a large board.
 */
export const largeBoardSchema: z.ZodObject<{
  boardType: z.ZodLiteral<'large'>;
  board: typeof largeBoardCoordinateMapSchema;
}> = _largeBoardSchemaObject;

// Verify manual type matches schema inference
const _assertExactLargeBoard: AssertExact<LargeBoard, LargeBoardSchemaType> =
  true;
