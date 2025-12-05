import type { LargeBoard, SmallBoard, StandardBoard } from '@entities';
import type { AssertExact } from '@utils';
import { z } from 'zod';
import { largeBoardSchema } from './largeBoard/largeBoard';
import { smallBoardSchema } from './smallBoard/smallBoard';
import { standardBoardSchema } from './standardBoard/standardBoard';

export const boardSizeType = ['standard', 'small', 'large'] as const;

export const boardSizeEnum: z.ZodType<BoardSize> = z.enum(boardSizeType);

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
 * List of valid board types.
 */
export const boardType = ['small', 'standard', 'large'] as const;

/**
 * The type of a board.
 */
export type BoardType = (typeof boardType)[number];

/** The small board type. */
export const SMALL_BOARD_TYPE: 'small' = boardType[0];

/** The standard board type. */
export const STANDARD_BOARD_TYPE: 'standard' = boardType[1];

/** The large board type. */
export const LARGE_BOARD_TYPE: 'large' = boardType[2];

const _boardSchemaObject = z.discriminatedUnion('boardType', [
  smallBoardSchema,
  standardBoardSchema,
  largeBoardSchema,
]);

/**
 * Schema-inferred type with strict coordinate types via intersection override.
 * Matches the pattern used in individual board files.
 */
type BoardSchemaType = z.infer<typeof _boardSchemaObject>;
export const boardSchema: z.ZodType<Board> = _boardSchemaObject;
/**
 * A board of the game.
 */
export type Board = StandardBoard | SmallBoard | LargeBoard;

// Verify manual type matches schema inference
const _assertExactBoard: AssertExact<Board, BoardSchemaType> = true;
