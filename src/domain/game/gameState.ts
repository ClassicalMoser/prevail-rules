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
}

/** @deprecated Use {@link GameStateForVisibility} or {@link GameState}. */
export type GameStateForBoard<
  _TBoard extends Board = Board,
  V extends GameStateVisibility = 'authoritative',
> = GameStateForVisibility<V>;

/** Every visibility combination. */
export type GameState =
  | GameStateForVisibility<'authoritative'>
  | GameStateForVisibility<'whiteSeen'>
  | GameStateForVisibility<'blackSeen'>;

// ---------------------------------------------------------------------------
// Zod — three visibility variants; board size is only on boardState.
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
  _authoritativeGameStateSchemaObject,
  _whiteSeenGameStateSchemaObject,
  _blackSeenGameStateSchemaObject,
]);

type GameStateSchemaType = z.infer<typeof _gameStateSchemaObject>;

const _assertExactGameState: AssertExact<GameState, GameStateSchemaType> = true;

export const gameStateSchema: z.ZodType<GameState> = _gameStateSchemaObject;
