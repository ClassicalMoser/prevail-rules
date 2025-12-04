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
