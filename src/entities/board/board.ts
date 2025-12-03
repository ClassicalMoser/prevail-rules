import type { LargeBoard, SmallBoard, StandardBoard } from "@entities";
import type { AssertExact } from "@utils";
import { z } from "zod";
import { largeBoardSchema } from "./largeBoard/largeBoard";
import { smallBoardSchema } from "./smallBoard/smallBoard";
import { standardBoardSchema } from "./standardBoard/standardBoard";

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
 *
 * Uses a discriminated union based on the `boardType` field to ensure type safety.
 * Each board type has different coordinate systems:
 * - Standard: A-1 through L-18
 * - Small: Smaller coordinate range
 * - Large: Larger coordinate range
 *
 * @example
 * ```typescript
 * // TypeScript will narrow the type based on boardType
 * if (board.boardType === "standard") {
 *   // board is StandardBoard
 *   const space = board.board["E-5"]; // ✅ Type-safe
 * }
 * ```
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
