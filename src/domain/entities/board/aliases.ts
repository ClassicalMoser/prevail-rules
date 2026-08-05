import type { Board, BoardType } from './board';
import { boardSchema } from './board';
import type { z } from 'zod';

/**
 * Deprecated migration shims. Prefer {@link Board} / {@link boardSchema}.
 */

/** @deprecated Use {@link Board}. */
export type BoardOfType<_T extends BoardType> = Board;

/** @deprecated Use {@link Board}. */
export type SmallBoard = Board;

/** @deprecated Use {@link Board}. */
export type StandardBoard = Board;

/** @deprecated Use {@link Board}. */
export type LargeBoard = Board;

/** @deprecated Use {@link boardSchema}. */
export const smallBoardSchema: z.ZodType<Board> = boardSchema;

/** @deprecated Use {@link boardSchema}. */
export const standardBoardSchema: z.ZodType<Board> = boardSchema;

/** @deprecated Use {@link boardSchema}. */
export const largeBoardSchema: z.ZodType<Board> = boardSchema;
