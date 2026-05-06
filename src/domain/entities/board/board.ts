import type { AssertExact } from "@utils";
import type { LargeBoard } from "./largeBoard";
import type { SmallBoard } from "./smallBoard";
import type { StandardBoard } from "./standardBoard";

import { z } from "zod";
import { largeBoardSchema } from "./largeBoard";
import { smallBoardSchema } from "./smallBoard";
import { standardBoardSchema } from "./standardBoard";

export const boardType = ["standard", "small", "large"] as const;

/**
 * The type of a board.
 */
export type BoardType = (typeof boardType)[number];

export const boardTypeEnum: z.ZodType<BoardType> = z.enum(boardType);

type BoardTypeEnumType = z.infer<typeof boardTypeEnum>;

/**
 * Assert that the board size type matches the schema.
 */
const _assertExactBoardType: AssertExact<BoardType, BoardTypeEnumType> = true;

/** The small board type. */
export const SMALL_BOARD_TYPE: "small" = boardType[0] as "small";

/** The standard board type. */
export const STANDARD_BOARD_TYPE: "standard" = boardType[1] as "standard";

/** The large board type. */
export const LARGE_BOARD_TYPE: "large" = boardType[2] as "large";

/**
 * A board of the game, discriminated by `boardType`.
 */
export type Board = StandardBoard | SmallBoard | LargeBoard;

const _boardSchemaObject = z.discriminatedUnion("boardType", [
  smallBoardSchema,
  standardBoardSchema,
  largeBoardSchema,
]);

export type BoardOfType<T extends BoardType> = Extract<Board, { boardType: T }>;

/**
 * Schema-inferred type with strict coordinate types via intersection override.
 * Matches the pattern used in individual board files.
 */
type BoardSchemaType = z.infer<typeof _boardSchemaObject>;

export const boardSchema: z.ZodType<Board> = _boardSchemaObject;

// Verify manual type matches schema inference
const _assertExactBoard: AssertExact<Board, BoardSchemaType> = true;
