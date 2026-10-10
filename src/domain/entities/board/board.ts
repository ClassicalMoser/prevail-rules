/**
 * Board state shape and Zod schema.
 *
 * Size is runtime state (`boardType`), not a TypeScript parameter on `Board`.
 * The map of spaces is typed against the full {@link Coordinate} union and
 * kept partial in the type; {@link boardSchema}'s `superRefine` checks that
 * the keys present match exactly the layout for `boardType`.
 *
 * Factories build boards from {@link getCoordinateLayout} / the size layouts;
 * this module only defines the persisted shape and the key-set invariant.
 */

import type { AssertExact } from '@utils';
import type { Coordinate } from './boardCoordinates';
import type { BoardSpace } from './boardSpace';
import type { CoordinateLayout } from './coordinateLayout';

import { z } from 'zod';
import { boardSpaceSchema } from './boardSpace';
import { coordinateLayoutMap } from './coordinateLayout';
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
   * {@link Coordinate} union; {@link boardSchema} requires exact key coverage
   * for `boardType`.
   */
  board: Partial<Record<Coordinate, BoardSpace>>;
}

/**
 * Every coordinate the layout for `boardTypeValue` expects to exist.
 *
 * Walks that size's row × column product via the layout's
 * `createCoordinate`. Used only by {@link boardSchema}'s refine — factories
 * and queries call {@link getCoordinateLayout} the same way for runtime work.
 */
function expectedCoordinateKeys(boardTypeValue: BoardType): Set<string> {
  const layout: CoordinateLayout = coordinateLayoutMap[boardTypeValue];
  const keys = new Set<string>();
  for (const row of layout.rowLetters) {
    for (const column of layout.columnNumbers) {
      keys.add(layout.createCoordinate(row, column));
    }
  }
  return keys;
}

/**
 * Wide object schema + refine: avoid per-size `z.object({ 'A-1': … })` shapes
 * that leak literal keys into inference and fight a single `Board` type.
 *
 * `partialRecord` accepts any subset of coordinates at the Zod object layer;
 * `superRefine` then requires exact equality with the layout product for the
 * declared `boardType` (missing keys and extra keys both become issues).
 */
const _boardSchemaObject = z
  .object({
    boardType: boardTypeEnum,
    board: z.partialRecord(coordinateSchema, boardSpaceSchema),
  })
  .strict()
  .superRefine((b, ctx) => {
    // Exact key set for this size — not “at least these keys”.
    const expected = expectedCoordinateKeys(b.boardType);
    const actual = new Set(Object.keys(b.board));

    for (const key of expected) {
      if (!actual.has(key)) {
        ctx.addIssue({
          code: 'custom',
          message: `Missing coordinate ${key} for ${b.boardType} board.`,
          path: ['board', key],
        });
      }
    }

    for (const key of actual) {
      if (!expected.has(key)) {
        ctx.addIssue({
          code: 'custom',
          message: `Unexpected coordinate ${key} for ${b.boardType} board.`,
          path: ['board', key],
        });
      }
    }
  });

type BoardSchemaType = z.infer<typeof _boardSchemaObject>;

/**
 * Parses and checks a full board against its `boardType` layout.
 * Shape invariants only — not game-mode or turn rules.
 */
export const boardSchema: z.ZodType<Board> = _boardSchemaObject;

const _assertExactBoard: AssertExact<Board, BoardSchemaType> = true;
