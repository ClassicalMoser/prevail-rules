import type { AssertExact } from '@utils';
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
 * Catalog of modes, keyed by name: the one table that says which board size
 * each mode is played on (§3.1.3). A caller looks a mode up by indexing it.
 */
export const gameModes = {
  // Epic, the largest battle, needs the large board's room.
  epic: { boardSize: 'large', name: 'epic' },
  // Mini, a short battle with a small army, fits the small board.
  mini: { boardSize: 'small', name: 'mini' },
  // Standard, the usual battle, is what the standard board is sized for.
  standard: { boardSize: 'standard', name: 'standard' },
  // The Tutorial, a first game, shares the small board with Mini, but none
  // of its army limits (§3.1.3).
  tutorial: { boardSize: 'small', name: 'tutorial' },
} as const;

/**
 * A game mode entry from {@link gameModes}.
 */
export type GameMode = (typeof gameModes)[GameModeName];

// Every named mode has an entry, and every entry is a named mode.
const _assertExactGameModeNames: AssertExact<GameModeName, GameMode['name']> =
  true;

// Every mode is played on a board size that exists.
const _assertBoardSizesAreBoardType: AssertExact<
  GameMode['boardSize'],
  Extract<BoardType, GameMode['boardSize']>
> = true;
