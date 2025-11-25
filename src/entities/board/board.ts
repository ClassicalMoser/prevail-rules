import type { SmallBoard, SmallBoardCoordinate } from "./smallBoard/index.js";

import type {
  StandardBoard,
  StandardBoardCoordinate,
} from "./standardBoard/index.js";
import { z } from "zod";
import { smallBoardSchema } from "./smallBoard/index.js";
import { standardBoardSchema } from "./standardBoard/index.js";

/**
 * The schema for a board.
 */
export const boardSchema = z.discriminatedUnion("boardType", [
  standardBoardSchema,
  smallBoardSchema,
]);

/**
 * A board of the game.
 */
export type Board = StandardBoard | SmallBoard;

/**
 * Helper type to extract the coordinate type from a board type
 */
export type BoardCoordinate<T extends Board> = T extends StandardBoard
  ? StandardBoardCoordinate
  : T extends SmallBoard
    ? SmallBoardCoordinate
    : never;
