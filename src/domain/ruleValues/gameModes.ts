import type { BoardType } from './boardSizes';
import { z } from 'zod';

/**
 * Iterable list of game mode names.
 */
export const gameModeNames = ['tutorial', 'mini', 'standard', 'epic'] as const;

/**
 * A named game mode.
 */
export type GameModeName = (typeof gameModeNames)[number];

/**
 * Schema for a game mode name. Typed as the exact enum, not a bare
 * `z.ZodType`, so a game's object schema can name its `gameMode` field's
 * schema exactly, as each projected view's does.
 */
export const gameModeNameSchema: z.ZodEnum<{ [K in GameModeName]: K }> =
  z.enum(gameModeNames);

/**
 * The board size each game mode is played on (§3.1.3): the one table that
 * says it. A caller looks a mode up by indexing it. Typed as a record over
 * every mode name, so a mode with no size, a size for no mode, or a size no
 * board has does not compile.
 */
export const boardSizeByGameMode: Readonly<Record<GameModeName, BoardType>> = {
  // Epic, the largest battle, needs the large board's room.
  epic: 'large',
  // Mini, a short battle with a small army, fits the small board.
  mini: 'small',
  // Standard, the usual battle, is what the standard board is sized for.
  standard: 'standard',
  // The Tutorial, a first game, shares the small board with Mini, but none
  // of its army limits (§3.1.3).
  tutorial: 'small',
};
