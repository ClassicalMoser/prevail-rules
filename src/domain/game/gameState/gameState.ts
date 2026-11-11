import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import type { AuthoritativeGameState } from './authoritativeGameState';
import type { BlackSeenGameState } from './blackSeenGameState';
import type { SpectatorGameState } from './spectatorGameState';
import type { WhiteSeenGameState } from './whiteSeenGameState';

import { z } from 'zod';
import { authoritativeGameStateSchema } from './authoritativeGameState';
import { blackSeenGameStateSchema } from './blackSeenGameState';
import { spectatorGameStateSchema } from './spectatorGameState';
import { whiteSeenGameStateSchema } from './whiteSeenGameState';

/**
 * Game state at any visibility: the union of the four views, told apart by
 * `visibility`, so a `switch` on it narrows the state and its cards together.
 */
export type GameState =
  | AuthoritativeGameState
  | WhiteSeenGameState
  | BlackSeenGameState
  | SpectatorGameState;

/**
 * Players whose card slice is owned (full card info) under game state `S`.
 * Opponent slices on seen views are hidden and must not be written as owned.
 * A spectator view owns neither side.
 */
export type OwnedPlayerForGameState<S extends GameState> =
  S extends AuthoritativeGameState
    ? PlayerSide
    : S extends WhiteSeenGameState
      ? 'white'
      : S extends BlackSeenGameState
        ? 'black'
        : never;

/**
 * Players whose card slice is hidden under game state `S`.
 * Authoritative has no hidden side (`never`). A spectator hides both.
 */
export type UnownedPlayerForGameState<S extends GameState> =
  S extends WhiteSeenGameState
    ? 'black'
    : S extends BlackSeenGameState
      ? 'white'
      : S extends SpectatorGameState
        ? PlayerSide
        : never;

const _gameStateSchemaObject: z.ZodDiscriminatedUnion<
  [
    typeof authoritativeGameStateSchema,
    typeof whiteSeenGameStateSchema,
    typeof blackSeenGameStateSchema,
    typeof spectatorGameStateSchema,
  ],
  'visibility'
> = z.discriminatedUnion('visibility', [
  authoritativeGameStateSchema,
  whiteSeenGameStateSchema,
  blackSeenGameStateSchema,
  spectatorGameStateSchema,
]);

type GameStateSchemaType = z.infer<typeof _gameStateSchemaObject>;

/** Schema for {@link GameState} at any visibility. */
export const gameStateSchema: typeof _gameStateSchemaObject =
  _gameStateSchemaObject;

const _assertExactGameState: AssertExact<GameState, GameStateSchemaType> = true;
