import { z } from 'zod';

/**
 * The three board sizes (§2.1.3). Which mode is fought on which is the game
 * mode catalog's to say (`boardSizeByGameMode`).
 */
export const boardType = ['standard', 'small', 'large'] as const;

/**
 * Which size a board is. Selects its layout in `coordinateLayoutMap`; does
 * not change the `Board` type's shape.
 */
export type BoardType = (typeof boardType)[number];

/**
 * Schema for a board size. Both sides derive from the {@link boardType} tuple,
 * so no separate AssertExact drift check is needed.
 */
export const boardTypeEnum: z.ZodType<BoardType> = z.enum(boardType);
