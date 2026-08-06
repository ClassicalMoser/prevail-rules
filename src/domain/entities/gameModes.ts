import type { AssertExact } from '@utils';
import type { BoardType } from './board';
import { z } from 'zod';

/**
 * Iterable list of game mode names.
 */
export const gameModeNames = ['tutorial', 'mini', 'standard', 'epic'] as const;

/**
 * A named game mode.
 */
export type GameModeName = (typeof gameModeNames)[number];

const _gameModeNameEnum = z.enum(gameModeNames);

type GameModeNameSchemaType = z.infer<typeof _gameModeNameEnum>;

const _assertExactGameModeName: AssertExact<
  GameModeName,
  GameModeNameSchemaType
> = true;

/** Schema for a game mode name. */
export const gameModeNameSchema: z.ZodType<GameModeName> = _gameModeNameEnum;

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

const _gameModeSchemaObject = z.union([
  z.object({
    boardSize: z.literal(gameModes[0].boardSize),
    name: z.literal(gameModes[0].name),
  }),
  z.object({
    boardSize: z.literal(gameModes[1].boardSize),
    name: z.literal(gameModes[1].name),
  }),
  z.object({
    boardSize: z.literal(gameModes[2].boardSize),
    name: z.literal(gameModes[2].name),
  }),
  z.object({
    boardSize: z.literal(gameModes[3].boardSize),
    name: z.literal(gameModes[3].name),
  }),
]);

type GameModeSchemaType = z.infer<typeof _gameModeSchemaObject>;

const _assertExactGameMode: AssertExact<GameMode, GameModeSchemaType> = true;

/** Schema for a catalog game mode (exact name ↔ boardSize pair). */
export const gameModeSchema: z.ZodType<GameMode> = _gameModeSchemaObject;
