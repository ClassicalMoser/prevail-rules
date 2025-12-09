import type { AssertExact } from '@utils';
import type { LargeBoardCoordinateMap } from './largeBoardMap';
import { z } from 'zod';
import { LARGE_BOARD_TYPE } from '../board';
import { largeBoardCoordinateMapSchema } from './largeBoardMap';

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
  board: LargeBoardCoordinateMap;
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
