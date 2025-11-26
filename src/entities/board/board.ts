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

export const boardSizeType = ["standard", "small", "large"] as const;

export const boardSizeEnum = z.enum(boardSizeType);

type BoardSizeEnumType = z.infer<typeof boardSizeEnum>;

/**
 * A size of a board.
 */
export type BoardSize = (typeof boardSizeType)[number];

/**
 * Assert that the board size type matches the schema.
 */
const _assertExactBoardSize: AssertExact<BoardSize, BoardSizeEnumType> = true;

/**
 * Mapping from board size types to their schemas.
 * This ensures the discriminated union stays in sync with boardSizeType.
 */
const boardSchemas = {
  standard: standardBoardSchema,
  small: smallBoardSchema,
  large: largeBoardSchema,
} as const satisfies Record<(typeof boardSizeType)[number], z.ZodObject<any>>;

/**
 * The schema for a board.
 * Uses boardSizeType to ensure all board types are included in the discriminated union.
 */
export const boardSchema = z.discriminatedUnion(
  "boardType",
  boardSizeType.map((size) => boardSchemas[size]) as [
    typeof standardBoardSchema,
    typeof smallBoardSchema,
    typeof largeBoardSchema,
  ]
);

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
