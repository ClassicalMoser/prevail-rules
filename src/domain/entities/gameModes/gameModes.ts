import type { AssertExact } from '@utils';
import type { BoardType } from '@entities/board';
import { z } from 'zod';

/**
 * Iterable list of game mode names.
 */
export const gameModeNames = ['tutorial', 'mini', 'standard', 'epic'] as const;

/**
 * A named game mode.
 */
export type GameModeName = (typeof gameModeNames)[number];

/** Schema for a game mode name. */
export const gameModeNameSchema: z.ZodType<GameModeName> =
  z.enum(gameModeNames);

/**
 * Catalog of modes: name ↔ board size lives here (values), not on per-mode interfaces.
 */
export const gameModes = [
  { boardSize: 'small', name: 'tutorial' },
  { boardSize: 'small', name: 'mini' },
  { boardSize: 'standard', name: 'standard' },
  { boardSize: 'large', name: 'epic' },
] as const;

/**
 * A game mode entry from {@link gameModes}.
 */
export type GameMode = (typeof gameModes)[number];

const _assertExactGameModeNames: AssertExact<GameModeName, GameMode['name']> =
  true;

const _assertBoardSizesAreBoardType: AssertExact<
  GameMode['boardSize'],
  Extract<BoardType, GameMode['boardSize']>
> = true;

/** One catalog row → exact `{ name, boardSize }` object schema (keeps literals narrow). */
function gameModeEntrySchema<
  const B extends string,
  const N extends string,
>(mode: { boardSize: B; name: N }) {
  return z
    .object({
      boardSize: z.literal(mode.boardSize),
      name: z.literal(mode.name),
    })
    .strict();
}

const _gameModeSchemaObject = z.union([
  gameModeEntrySchema(gameModes[0]),
  gameModeEntrySchema(gameModes[1]),
  gameModeEntrySchema(gameModes[2]),
  gameModeEntrySchema(gameModes[3]),
]);

type GameModeSchemaType = z.infer<typeof _gameModeSchemaObject>;

/** Schema for a catalog game mode (exact name ↔ boardSize pair). */
export const gameModeSchema: z.ZodType<GameMode> = _gameModeSchemaObject;

const _assertExactGameMode: AssertExact<GameMode, GameModeSchemaType> = true;
