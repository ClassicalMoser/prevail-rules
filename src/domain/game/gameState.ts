import type {
  Board,
  CardState,
  LargeBoard,
  PlayerSide,
  SmallBoard,
  StandardBoard,
  UnitInstance,
} from "@entities";
import { z } from "zod";
import {
  largeRoundStateSchema,
  RoundStateForBoard,
  smallRoundStateSchema,
  standardRoundStateSchema,
} from "./roundState";
import type { AssertExact } from "@utils";
import {
  cardStateSchema,
  largeBoardSchema,
  playerSideSchema,
  smallBoardSchema,
  standardBoardSchema,
  unitInstanceSchema,
} from "@entities";

/**
 * All game states, discriminated by root {@link GameState.boardType}.
 */
export type GameStateForBoard<TBoard extends Board> = {
  /**
   * Root discriminator for {@link GameState}; must match `boardState.boardType`.
   * One literal for TS narrowing and Zod — no extra type parameters.
   */
  boardType: TBoard["boardType"];
  /** The current round number of the game. */
  currentRoundNumber: number;
  /** The state of the current round of the game. */
  currentRoundState: RoundStateForBoard<TBoard>;
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
  /** Board and piece layout for the standard size. */
  boardState: TBoard;
};

export type GameState =
  | GameStateForBoard<SmallBoard>
  | GameStateForBoard<StandardBoard>
  | GameStateForBoard<LargeBoard>;

// ---------------------------------------------------------------------------
// Zod
// ---------------------------------------------------------------------------

const _smallGameStateSchemaObject = z.object({
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  currentRoundNumber: z.int().min(0),
  currentRoundState: smallRoundStateSchema,
  currentInitiative: playerSideSchema,
  cardState: cardStateSchema,
  reservedUnits: z.set(unitInstanceSchema),
  routedUnits: z.set(unitInstanceSchema),
  lostCommanders: z.set(playerSideSchema),
  boardState: smallBoardSchema,
});

type SmallGameStateSchemaType = z.infer<typeof _smallGameStateSchemaObject>;

const _assertExactSmallGameState: AssertExact<
  GameStateForBoard<SmallBoard>,
  SmallGameStateSchemaType
> = true;

export const smallGameStateSchema: z.ZodType<GameStateForBoard<SmallBoard>> =
  _smallGameStateSchemaObject;

const _standardGameStateSchemaObject = z.object({
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  currentRoundNumber: z.int().min(0),
  currentRoundState: standardRoundStateSchema,
  currentInitiative: playerSideSchema,
  cardState: cardStateSchema,
  reservedUnits: z.set(unitInstanceSchema),
  routedUnits: z.set(unitInstanceSchema),
  lostCommanders: z.set(playerSideSchema),
  boardState: standardBoardSchema,
});

type StandardGameStateSchemaType = z.infer<typeof _standardGameStateSchemaObject>;

const _assertExactTutorialGameState: AssertExact<
  GameStateForBoard<StandardBoard>,
  StandardGameStateSchemaType
> = true;

export const standardGameStateSchema: z.ZodType<GameStateForBoard<StandardBoard>> =
  _standardGameStateSchemaObject;

const _largeGameStateSchemaObject = z.object({
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  currentRoundNumber: z.int().min(0),
  currentRoundState: largeRoundStateSchema,
  currentInitiative: playerSideSchema,
  cardState: cardStateSchema,
  reservedUnits: z.set(unitInstanceSchema),
  routedUnits: z.set(unitInstanceSchema),
  lostCommanders: z.set(playerSideSchema),
  boardState: largeBoardSchema,
});

type LargeGameStateSchemaType = z.infer<typeof _largeGameStateSchemaObject>;

const _assertExactLargeGameState: AssertExact<
  GameStateForBoard<LargeBoard>,
  LargeGameStateSchemaType
> = true;

export const largeGameStateSchema: z.ZodType<GameStateForBoard<LargeBoard>> =
  _largeGameStateSchemaObject;

/** Wide schema: discriminated on root `boardType` (must match nested `boardState.boardType`). */
const _gameStateSchemaObject = z.discriminatedUnion("boardType", [
  _smallGameStateSchemaObject,
  _standardGameStateSchemaObject,
  _largeGameStateSchemaObject,
]);

type GameStateSchemaType = z.infer<typeof _gameStateSchemaObject>;

const _assertExactGameState: AssertExact<GameState, GameStateSchemaType> = true;

export const gameStateSchema: z.ZodType<GameState> = _gameStateSchemaObject;
