/**
 * Board state shape and Zod schema.
 *
 * Size is runtime state (`boardType`), not a TypeScript parameter on `Board`.
 * The map of spaces is typed against the full {@link Coordinate} union and
 * kept partial in the type; `refineBoardLayout` in `@legality` checks that
 * the keys present match exactly the layout for `boardType`.
 *
 * Factories build boards from {@link getCoordinateLayout} / the size layouts;
 * this module only defines the persisted shape.
 */

import type { AssertExact } from '@utils';
import type { Coordinate } from './boardCoordinates';
import type { BoardSpace } from './boardSpace';

import { z } from 'zod';
import { boardSpaceSchema } from './boardSpace';
import { coordinateSchema } from './boardCoordinates';

/** Discriminator values for which grid a board uses. */
export const boardType = ['standard', 'small', 'large'] as const;

/**
 * Which coordinate layout this board uses.
 * Indexes {@link coordinateLayoutMap}; does not change the `Board` type shape.
 */
export type BoardType = (typeof boardType)[number];

/** Zod enum for {@link BoardType}. */
export const boardTypeEnum: z.ZodType<BoardType> = z.enum(boardType);

/**
 * A board of the game.
 *
 * - `boardType` — which size layout applies (value, not a type parameter).
 * - `board` — spaces keyed by {@link Coordinate}. Typed as partial over the
 *   full union so small/standard boards are not forced to name every large
 *   key at the type level; completeness for the active size is a refine.
 */
export interface Board {
  /** Which grid size this board uses (`small` / `standard` / `large`). */
  boardType: BoardType;
  /**
   * Spaces by coordinate. Partial at the type level over the full
   * {@link Coordinate} union; `refineBoardLayout` in `@legality` requires
   * exact key coverage for `boardType`.
   */
  board: Partial<Record<Coordinate, BoardSpace>>;
}

/**
 * Wide object schema: avoid per-size `z.object({ 'A-1': … })` shapes that
 * leak literal keys into inference and fight a single `Board` type.
 *
 * `partialRecord` accepts any subset of coordinates. Exact equality with the
 * layout for the declared `boardType` is a rule in `@legality`
 * (`refineBoardLayout`).
 */
const _boardSchemaObject = z
  .object({
    boardType: boardTypeEnum,
    board: z.partialRecord(coordinateSchema, boardSpaceSchema),
  })
  .strict();

type BoardSchemaType = z.infer<typeof _boardSchemaObject>;

/**
 * Parses a board's shape. Whether its spaces match its size is checked by
 * `refineBoardLayout` in `@legality`.
 */
export const boardSchema: z.ZodType<Board> = _boardSchemaObject;

const _assertExactBoard: AssertExact<Board, BoardSchemaType> = true;
