import type {
  AuthoritativeCardState,
  BlackSeenCardState,
  Board,
  CardState,
  PlayerSide,
  UnitInstance,
  WhiteSeenCardState,
} from '@entities';
import { z } from 'zod';
import type { RoundState } from './roundState';
import type { AssertExact } from '@utils';
import {
  authoritativeCardStateSchema,
  blackSeenCardStateSchema,
  boardSchema,
  playerSideSchema,
  unitInstanceSchema,
  whiteSeenCardStateSchema,
} from '@entities';
import { roundStateSchema } from './roundState';

/** Visibility regime for {@link CardState}, reused as the game-state visibility axis. */
export type GameStateVisibility = CardState['visibility'];

/** Maps a visibility literal to its corresponding card-state shape. */
export type CardStateForVisibility<V extends GameStateVisibility> =
  V extends 'authoritative'
    ? AuthoritativeCardState
    : V extends 'whiteSeen'
      ? WhiteSeenCardState
      : BlackSeenCardState;

/**
 * Game state for a card visibility regime.
 * Board size lives only on {@link Board.boardType} (`boardState.boardType`).
 *
 * @param V - Card visibility (`authoritative` | `whiteSeen` | `blackSeen`)
 */
export interface GameStateForVisibility<
  V extends GameStateVisibility = 'authoritative',
> {
  /** The current round number of the game. */
  currentRoundNumber: number;
  /** The state of the current round of the game. */
  currentRoundState: RoundState;
  /** Which player currently has initiative. */
  currentInitiative: PlayerSide;
  /** The state of both players' cards for this visibility regime. */
  cardState: CardStateForVisibility<V>;
  /** Units not yet placed on the board. */
  reservedUnits: UnitInstance[];
  /** The units that have been routed during the game. */
  routedUnits: UnitInstance[];
  /** The commanders that have been lost during the game. */
  lostCommanders: PlayerSide[];
  /** Board and piece layout. */
  boardState: Board;
  /**
   * Set by `gameOver` apply. Absent while the game is ongoing;
   * `PlayerSide` for a win; `null` for a draw.
   */
  winner?: PlayerSide | null;
}

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

/** Narrows {@link GameState} to the authoritative visibility member. */
export function isAuthoritativeGameState(
  state: GameState,
): state is GameStateForVisibility<'authoritative'> {
  return state.cardState.visibility === 'authoritative';
}

// ---------------------------------------------------------------------------
// Zod — precise visibility schemas + one wide schema aligned with {@link GameState}.
// ---------------------------------------------------------------------------

const _authoritativeGameStateSchemaObject = z
  .object({
    boardState: boardSchema,
    cardState: authoritativeCardStateSchema,
    currentInitiative: playerSideSchema,
    currentRoundNumber: z.int().min(0),
    currentRoundState: roundStateSchema,
    lostCommanders: z.array(playerSideSchema),
    reservedUnits: z.array(unitInstanceSchema),
    routedUnits: z.array(unitInstanceSchema),
    winner: playerSideSchema.nullable().optional(),
  })
  .strict();

type AuthoritativeGameStateSchemaType = z.infer<
  typeof _authoritativeGameStateSchemaObject
>;

const _assertExactAuthoritativeGameState: AssertExact<
  GameStateForVisibility<'authoritative'>,
  AuthoritativeGameStateSchemaType
> = true;

export const authoritativeGameStateSchema: z.ZodType<
  GameStateForVisibility<'authoritative'>
> = _authoritativeGameStateSchemaObject;

const _whiteSeenGameStateSchemaObject = z
  .object({
    boardState: boardSchema,
    cardState: whiteSeenCardStateSchema,
    currentInitiative: playerSideSchema,
    currentRoundNumber: z.int().min(0),
    currentRoundState: roundStateSchema,
    lostCommanders: z.array(playerSideSchema),
    reservedUnits: z.array(unitInstanceSchema),
    routedUnits: z.array(unitInstanceSchema),
    winner: playerSideSchema.nullable().optional(),
  })
  .strict();

type WhiteSeenGameStateSchemaType = z.infer<
  typeof _whiteSeenGameStateSchemaObject
>;

const _assertExactWhiteSeenGameState: AssertExact<
  GameStateForVisibility<'whiteSeen'>,
  WhiteSeenGameStateSchemaType
> = true;

export const whiteSeenGameStateSchema: z.ZodType<
  GameStateForVisibility<'whiteSeen'>
> = _whiteSeenGameStateSchemaObject;

const _blackSeenGameStateSchemaObject = z
  .object({
    boardState: boardSchema,
    cardState: blackSeenCardStateSchema,
    currentInitiative: playerSideSchema,
    currentRoundNumber: z.int().min(0),
    currentRoundState: roundStateSchema,
    lostCommanders: z.array(playerSideSchema),
    reservedUnits: z.array(unitInstanceSchema),
    routedUnits: z.array(unitInstanceSchema),
    winner: playerSideSchema.nullable().optional(),
  })
  .strict();

type BlackSeenGameStateSchemaType = z.infer<
  typeof _blackSeenGameStateSchemaObject
>;

const _assertExactBlackSeenGameState: AssertExact<
  GameStateForVisibility<'blackSeen'>,
  BlackSeenGameStateSchemaType
> = true;

export const blackSeenGameStateSchema: z.ZodType<
  GameStateForVisibility<'blackSeen'>
> = _blackSeenGameStateSchemaObject;

const _gameStateSchemaObject = z.union([
  authoritativeGameStateSchema,
  whiteSeenGameStateSchema,
  blackSeenGameStateSchema,
]);

type GameStateSchemaType = z.infer<typeof _gameStateSchemaObject>;

const _assertExactGameState: AssertExact<GameState, GameStateSchemaType> = true;

export const gameStateSchema: z.ZodType<GameState> = _gameStateSchemaObject;
