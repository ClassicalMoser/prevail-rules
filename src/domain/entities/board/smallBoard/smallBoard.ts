import type { AssertExact } from '@utils';
import type { SmallBoardCoordinateMap } from './smallBoardMap';
import { z } from 'zod';
import { SMALL_BOARD_TYPE } from '../board';
import { smallBoardCoordinateMapSchema } from './smallBoardMap';

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
  board: SmallBoardCoordinateMap;
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
