import type { AssertExact } from "../../utils/assertExact.js";
import type { LargeBoard } from "./largeBoard/index.js";
import type { SmallBoard } from "./smallBoard/index.js";

import type { StandardBoard } from "./standardBoard/index.js";
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
 * The schema for a board.
 */
export const boardSchema = z.discriminatedUnion("boardType", [
  smallBoardSchema,
  standardBoardSchema,
  largeBoardSchema,
]);

/**
 * Schema-inferred type with strict coordinate types via intersection override.
 * Matches the pattern used in individual board files.
 */
export type BoardSchemaType = z.infer<typeof boardSchema>;
/**
 * A board of the game.
 */
export type Board = StandardBoard | SmallBoard | LargeBoard;

// Verify manual type matches schema inference
const _assertExactBoard: AssertExact<Board, BoardSchemaType> = true;
