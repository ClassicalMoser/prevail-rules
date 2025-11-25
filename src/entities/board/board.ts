import type { AssertExact } from "../../utils/assertExact.js";
import type { BoardSpace } from "./boardSpace.js";
import type { LargeBoard, LargeBoardCoordinate } from "./largeBoard/index.js";
import type { SmallBoard, SmallBoardCoordinate } from "./smallBoard/index.js";

import type {
  StandardBoard,
  StandardBoardCoordinate,
} from "./standardBoard/index.js";
import { z } from "zod";
import { largeBoardSchema } from "./largeBoard/index.js";
import { smallBoardSchema } from "./smallBoard/index.js";
import { standardBoardSchema } from "./standardBoard/index.js";

/**
 * The schema for a board.
 */
export const boardSchema = z.discriminatedUnion("boardType", [
  standardBoardSchema,
  smallBoardSchema,
  largeBoardSchema,
]);

/**
 * Schema-inferred type with strict coordinate types via intersection override.
 * Matches the pattern used in individual board files.
 */
type BoardSchemaType = z.infer<typeof boardSchema> &
  (
    | {
        boardType: "standard";
        board: Record<StandardBoardCoordinate, BoardSpace>;
      }
    | { boardType: "small"; board: Record<SmallBoardCoordinate, BoardSpace> }
    | { boardType: "large"; board: Record<LargeBoardCoordinate, BoardSpace> }
  );

/**
 * A board of the game.
 */
export type Board = StandardBoard | SmallBoard | LargeBoard;

// Verify manual type matches schema inference
const _assertExactBoard: AssertExact<Board, BoardSchemaType> = true;

/**
 * Helper type to extract the coordinate type from a board type
 */
export type BoardCoordinate<T extends Board> = T extends StandardBoard
  ? StandardBoardCoordinate
  : T extends SmallBoard
    ? SmallBoardCoordinate
    : T extends LargeBoard
      ? LargeBoardCoordinate
      : never;
