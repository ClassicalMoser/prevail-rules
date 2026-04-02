import type {
  Board,
  CardState,
  LargeBoard,
  PlayerSide,
  SmallBoard,
  StandardBoard,
  UnitInstance,
} from '@entities';
import type { AssertExact } from '@utils';
import type { RoundState } from './roundState';

import {
  cardStateSchema,
  largeBoardSchema,
  playerSideSchema,
  smallBoardSchema,
  standardBoardSchema,
  unitInstanceSchema,
} from '@entities';
import { z } from 'zod';
import { roundStateSchema } from './roundState';

/** Shared fields for all board sizes (discriminated by `boardState.boardType`). */
export interface GameStateBase {
  /** The current round number of the game. */
  currentRoundNumber: number;
  /** The state of the current round of the game. */
  currentRoundState: RoundState;
  /** Which player currently has initiative. */
  currentInitiative: PlayerSide;
  /** The state of both players' cards. */
  cardState: CardState;
  /** Units not yet placed on the board. */
  reservedUnits: Set<UnitInstance>;
  /** The units that have been routed during the game. */
  routedUnits: Set<UnitInstance>;
  /** The commanders that have been lost during the game. */
  lostCommanders: Set<PlayerSide>;
}

export interface StandardGameState extends GameStateBase {
  boardState: StandardBoard;
}

export interface SmallGameState extends GameStateBase {
  boardState: SmallBoard;
}

export interface LargeGameState extends GameStateBase {
  boardState: LargeBoard;
}

/**
 * All game states, discriminated by `boardState` (`boardType` on the board).
 * Narrow with `if (state.boardState.boardType === 'standard')` → {@link StandardGameState}.
 */
export type GameState = StandardGameState | SmallGameState | LargeGameState;

/**
 * Game state correlated with a generic `TBoard` (e.g. procedure/transform type parameters).
 * `GameStateBase & { boardState: TBoard }` keeps `state.boardState` and nested types
 * (`UnitPlacement<TBoard>`, etc.) correlated under a naked `TBoard extends Board` type parameter.
 * A conditional alias (like `MoveUnitEvent<TBoard>`) would widen unresolved generics to
 * {@link GameState} and break procedure/query typing.
 *
 * Mode-specific setup / victory / rules **traits** belong on the {@link Game} / `gameType` side
 * (Layer 5 DU), not on {@link GameState} branches — so this intersection remains the right shape
 * for generic board threading.
 *
 * Prefer {@link GameState} when you mean “any board”.
 */
export type GameStateWithBoard<TBoard extends Board = Board> = GameStateBase & {
  boardState: TBoard;
};

const _gameStateSharedFields = {
  currentRoundNumber: z.int().min(0),
  currentRoundState: roundStateSchema,
  currentInitiative: playerSideSchema,
  cardState: cardStateSchema,
  reservedUnits: z.set(unitInstanceSchema),
  routedUnits: z.set(unitInstanceSchema),
  lostCommanders: z.set(playerSideSchema),
} as const;

const _standardGameStateSchemaObject = z.object({
  ..._gameStateSharedFields,
  boardState: standardBoardSchema,
});

const _smallGameStateSchemaObject = z.object({
  ..._gameStateSharedFields,
  boardState: smallBoardSchema,
});

const _largeGameStateSchemaObject = z.object({
  ..._gameStateSharedFields,
  boardState: largeBoardSchema,
});

const _gameStateSchemaObject = z.union([
  _standardGameStateSchemaObject,
  _smallGameStateSchemaObject,
  _largeGameStateSchemaObject,
]);

type GameStateSchemaType = z.infer<typeof _gameStateSchemaObject>;

const _assertExactGameState: AssertExact<GameState, GameStateSchemaType> = true;

/** Wide schema: union of per-board game state shapes (discriminated at `boardState.boardType`). */
export const gameStateSchema: z.ZodType<GameState> = _gameStateSchemaObject;

/** {@link StandardGameState} */
export const gameStateSchemaForStandardBoard: z.ZodType<StandardGameState> =
  _standardGameStateSchemaObject;

/** {@link SmallGameState} */
export const gameStateSchemaForSmallBoard: z.ZodType<SmallGameState> =
  _smallGameStateSchemaObject;

/** {@link LargeGameState} */
export const gameStateSchemaForLargeBoard: z.ZodType<LargeGameState> =
  _largeGameStateSchemaObject;
