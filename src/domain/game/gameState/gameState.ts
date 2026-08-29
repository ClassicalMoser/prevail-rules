import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import type { GameStateForVisibility } from './gameStateForVisibility';

import { z } from 'zod';
import { authoritativeGameStateSchema } from './authoritativeGameState';
import { blackSeenGameStateSchema } from './blackSeenGameState';
import { whiteSeenGameStateSchema } from './whiteSeenGameState';

/**
 * Game state at any visibility.
 * Union of three concrete visibility states (not an object-of-unions), so a
 * wide {@link GameState} is not assignable to {@link GameStateForVisibility}
 * for a specific visibility without narrowing.
 */
export type GameState =
  | GameStateForVisibility<'authoritative'>
  | GameStateForVisibility<'whiteSeen'>
  | GameStateForVisibility<'blackSeen'>;

/**
 * Players whose card slice is owned (full card info) under game state `S`.
 * Opponent slices on seen views are hidden and must not be written as owned.
 */
export type OwnedPlayerForGameState<S extends GameState> =
  S extends GameStateForVisibility<'whiteSeen'>
    ? 'white'
    : S extends GameStateForVisibility<'blackSeen'>
      ? 'black'
      : PlayerSide;

/**
 * Players whose card slice is hidden under game state `S`.
 * Authoritative has no hidden side (`never`).
 */
export type UnownedPlayerForGameState<S extends GameState> =
  S extends GameStateForVisibility<'whiteSeen'>
    ? 'black'
    : S extends GameStateForVisibility<'blackSeen'>
      ? 'white'
      : never;

const _gameStateSchemaObject = z.union([
  authoritativeGameStateSchema,
  whiteSeenGameStateSchema,
  blackSeenGameStateSchema,
]);

type GameStateSchemaType = z.infer<typeof _gameStateSchemaObject>;

/** Schema for {@link GameState} at any visibility. */
export const gameStateSchema: z.ZodType<GameState> = _gameStateSchemaObject;

const _assertExactGameState: AssertExact<GameState, GameStateSchemaType> = true;
