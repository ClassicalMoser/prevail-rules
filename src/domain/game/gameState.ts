import type {
  Board,
  CardState,
  LargeBoard,
  PlayerSide,
  SmallBoard,
  StandardBoard,
  UnitInstance,
} from '@entities';
import { z } from 'zod';
import type { RoundStateForBoard } from './roundState';
import {
  largeRoundStateSchema,
  smallRoundStateSchema,
  standardRoundStateSchema,
} from './roundState';
import type { AssertExact } from '@utils';
import {
  cardStateSchema,
  largeBoardSchema,
  playerSideSchema,
  smallBoardSchema,
  standardBoardSchema,
  unitInstanceSchema,
} from '@entities';

/**
 * All game states, discriminated by root {@link GameState.boardType}.
 */
export interface GameStateForBoard<TBoard extends Board> {
  /**
   * Root discriminator for {@link GameState}; must match `boardState.boardType`.
   * One literal for TS narrowing and Zod — no extra type parameters.
   */
  boardType: TBoard['boardType'];
  /** The current round number of the game. */
  currentRoundNumber: number;
  /** The state of the current round of the game. */
  currentRoundState: RoundStateForBoard<TBoard>;
  /** Which player currently has initiative. */
  currentInitiative: PlayerSide;
  /** The state of both players' cards. */
  cardState: CardState;
  /** Units not yet placed on the board. */
  reservedUnits: UnitInstance[];
  /** The units that have been routed during the game. */
  routedUnits: UnitInstance[];
  /** The commanders that have been lost during the game. */
  lostCommanders: PlayerSide[];
  /** Board and piece layout for the standard size. */
  boardState: TBoard;
}

export type GameState =
  | GameStateForBoard<SmallBoard>
  | GameStateForBoard<StandardBoard>
  | GameStateForBoard<LargeBoard>;

// ---------------------------------------------------------------------------
// Zod
// ---------------------------------------------------------------------------

const _smallGameStateSchemaObject = z.object({
  boardState: smallBoardSchema,
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  cardState: cardStateSchema,
  currentInitiative: playerSideSchema,
  currentRoundNumber: z.int().min(0),
  currentRoundState: smallRoundStateSchema,
  lostCommanders: z.array(playerSideSchema),
  reservedUnits: z.array(unitInstanceSchema),
  routedUnits: z.array(unitInstanceSchema),
});

type SmallGameStateSchemaType = z.infer<typeof _smallGameStateSchemaObject>;

const _assertExactSmallGameState: AssertExact<
  GameStateForBoard<SmallBoard>,
  SmallGameStateSchemaType
> = true;

export const smallGameStateSchema: z.ZodType<GameStateForBoard<SmallBoard>> =
  _smallGameStateSchemaObject;

const _standardGameStateSchemaObject = z.object({
  boardState: standardBoardSchema,
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  cardState: cardStateSchema,
  currentInitiative: playerSideSchema,
  currentRoundNumber: z.int().min(0),
  currentRoundState: standardRoundStateSchema,
  lostCommanders: z.array(playerSideSchema),
  reservedUnits: z.array(unitInstanceSchema),
  routedUnits: z.array(unitInstanceSchema),
});

type StandardGameStateSchemaType = z.infer<
  typeof _standardGameStateSchemaObject
>;

const _assertExactTutorialGameState: AssertExact<
  GameStateForBoard<StandardBoard>,
  StandardGameStateSchemaType
> = true;

export const standardGameStateSchema: z.ZodType<
  GameStateForBoard<StandardBoard>
> = _standardGameStateSchemaObject;

const _largeGameStateSchemaObject = z.object({
  boardState: largeBoardSchema,
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  cardState: cardStateSchema,
  currentInitiative: playerSideSchema,
  currentRoundNumber: z.int().min(0),
  currentRoundState: largeRoundStateSchema,
  lostCommanders: z.array(playerSideSchema),
  reservedUnits: z.array(unitInstanceSchema),
  routedUnits: z.array(unitInstanceSchema),
});

type LargeGameStateSchemaType = z.infer<typeof _largeGameStateSchemaObject>;

const _assertExactLargeGameState: AssertExact<
  GameStateForBoard<LargeBoard>,
  LargeGameStateSchemaType
> = true;

export const largeGameStateSchema: z.ZodType<GameStateForBoard<LargeBoard>> =
  _largeGameStateSchemaObject;

/** Wide schema: discriminated on root `boardType` (must match nested `boardState.boardType`). */
const _gameStateSchemaObject = z.discriminatedUnion('boardType', [
  _smallGameStateSchemaObject,
  _standardGameStateSchemaObject,
  _largeGameStateSchemaObject,
]);

type GameStateSchemaType = z.infer<typeof _gameStateSchemaObject>;

const _assertExactGameState: AssertExact<GameState, GameStateSchemaType> = true;

export const gameStateSchema: z.ZodType<GameState> = _gameStateSchemaObject;
