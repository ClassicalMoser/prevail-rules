import type { AssertExact } from '@utils';
import type { Coordinate } from './boardCoordinates';
import type { BoardSpace } from './boardSpace';
import type { CoordinateLayout } from './coordinateLayout';

import { z } from 'zod';
import { boardSpaceSchema } from './boardSpace';
import { coordinateLayoutMap } from './coordinateLayout';
import { coordinateSchema } from './boardCoordinates';

export const boardType = ['standard', 'small', 'large'] as const;

/**
 * The type of a board.
 */
export type BoardType = (typeof boardType)[number];

export const boardTypeEnum: z.ZodType<BoardType> = z.enum(boardType);

/**
 * A board of the game. Size is state (`boardType`), not a type parameter.
 * `board` is partial: only coordinates valid for this size are present.
 */
export interface Board {
  boardType: BoardType;
  board: Partial<Record<Coordinate, BoardSpace>>;
}

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

const _boardSchemaObject = z
  .object({
    boardType: boardTypeEnum,
    board: z.partialRecord(coordinateSchema, boardSpaceSchema),
  })
  .strict()
  .superRefine((b, ctx) => {
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

export const boardSchema: z.ZodType<Board> = _boardSchemaObject;

const _assertExactBoard: AssertExact<Board, BoardSchemaType> = true;
