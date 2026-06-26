import type {
  AuthoritativeCardState,
  BlackSeenCardState,
  Board,
  CardState,
  LargeBoard,
  PlayerSide,
  SmallBoard,
  StandardBoard,
  UnitInstance,
  WhiteSeenCardState,
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
  authoritativeCardStateSchema,
  blackSeenCardStateSchema,
  largeBoardSchema,
  playerSideSchema,
  smallBoardSchema,
  standardBoardSchema,
  unitInstanceSchema,
  whiteSeenCardStateSchema,
} from '@entities';

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
 * Game state for a board size and card visibility regime.
 *
 * @param TBoard - Board geometry (`small` | `standard` | `large`)
 * @param V - Card visibility (`authoritative` | `whiteSeen` | `blackSeen`)
 */
export interface GameStateForBoard<
  TBoard extends Board,
  V extends GameStateVisibility = 'authoritative',
> {
  /**
   * Root discriminator for {@link GameState}; must match `boardState.boardType`.
   * One literal for TS narrowing and Zod — no extra type parameter.
   */
  boardType: TBoard['boardType'];
  /** The current round number of the game. */
  currentRoundNumber: number;
  /** The state of the current round of the game. */
  currentRoundState: RoundStateForBoard<TBoard>;
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
  boardState: TBoard;
}

/** All game states for one visibility regime across board sizes. */
export type GameStateForVisibility<V extends GameStateVisibility> =
  | GameStateForBoard<SmallBoard, V>
  | GameStateForBoard<StandardBoard, V>
  | GameStateForBoard<LargeBoard, V>;

/** Every board size × visibility combination. */
export type GameState =
  | GameStateForVisibility<'authoritative'>
  | GameStateForVisibility<'whiteSeen'>
  | GameStateForVisibility<'blackSeen'>;

// ---------------------------------------------------------------------------
// Zod
// ---------------------------------------------------------------------------

function createGameStateSchemaObject<
  TBoard extends Board,
  V extends GameStateVisibility,
>(config: {
  boardSchema: z.ZodType<TBoard>;
  boardType: TBoard['boardType'];
  roundStateSchema: z.ZodType<RoundStateForBoard<TBoard>>;
  cardStateSchema: z.ZodType<CardStateForVisibility<V>>;
}): z.ZodType<GameStateForBoard<TBoard, V>> {
  return z.object({
    boardState: config.boardSchema,
    boardType: z.literal(config.boardType),
    cardState: config.cardStateSchema,
    currentInitiative: playerSideSchema,
    currentRoundNumber: z.int().min(0),
    currentRoundState: config.roundStateSchema,
    lostCommanders: z.array(playerSideSchema),
    reservedUnits: z.array(unitInstanceSchema),
    routedUnits: z.array(unitInstanceSchema),
  });
}

// --- Small -----------------------------------------------------------------

const _smallAuthoritativeGameStateSchemaObject = createGameStateSchemaObject({
  boardSchema: smallBoardSchema,
  boardType: 'small' satisfies SmallBoard['boardType'],
  cardStateSchema: authoritativeCardStateSchema,
  roundStateSchema: smallRoundStateSchema,
});

type SmallAuthoritativeGameStateSchemaType = z.infer<
  typeof _smallAuthoritativeGameStateSchemaObject
>;

const _assertExactSmallAuthoritativeGameState: AssertExact<
  GameStateForBoard<SmallBoard, 'authoritative'>,
  SmallAuthoritativeGameStateSchemaType
> = true;

export const smallAuthoritativeGameStateSchema: z.ZodType<
  GameStateForBoard<SmallBoard, 'authoritative'>
> = _smallAuthoritativeGameStateSchemaObject;

const _smallWhiteSeenGameStateSchemaObject = createGameStateSchemaObject({
  boardSchema: smallBoardSchema,
  boardType: 'small' satisfies SmallBoard['boardType'],
  cardStateSchema: whiteSeenCardStateSchema,
  roundStateSchema: smallRoundStateSchema,
});

type SmallWhiteSeenGameStateSchemaType = z.infer<
  typeof _smallWhiteSeenGameStateSchemaObject
>;

const _assertExactSmallWhiteSeenGameState: AssertExact<
  GameStateForBoard<SmallBoard, 'whiteSeen'>,
  SmallWhiteSeenGameStateSchemaType
> = true;

export const smallWhiteSeenGameStateSchema: z.ZodType<
  GameStateForBoard<SmallBoard, 'whiteSeen'>
> = _smallWhiteSeenGameStateSchemaObject;

const _smallBlackSeenGameStateSchemaObject = createGameStateSchemaObject({
  boardSchema: smallBoardSchema,
  boardType: 'small' satisfies SmallBoard['boardType'],
  cardStateSchema: blackSeenCardStateSchema,
  roundStateSchema: smallRoundStateSchema,
});

type SmallBlackSeenGameStateSchemaType = z.infer<
  typeof _smallBlackSeenGameStateSchemaObject
>;

const _assertExactSmallBlackSeenGameState: AssertExact<
  GameStateForBoard<SmallBoard, 'blackSeen'>,
  SmallBlackSeenGameStateSchemaType
> = true;

export const smallBlackSeenGameStateSchema: z.ZodType<
  GameStateForBoard<SmallBoard, 'blackSeen'>
> = _smallBlackSeenGameStateSchemaObject;

const _smallGameStateSchemaObject = z.union([
  _smallAuthoritativeGameStateSchemaObject,
  _smallWhiteSeenGameStateSchemaObject,
  _smallBlackSeenGameStateSchemaObject,
]);

/** Any small-board game state (all visibility regimes). */
export const smallGameStateSchema: z.ZodType<
  GameStateForBoard<SmallBoard, GameStateVisibility>
> = _smallGameStateSchemaObject;

// --- Standard --------------------------------------------------------------

const _standardAuthoritativeGameStateSchemaObject = createGameStateSchemaObject(
  {
    boardSchema: standardBoardSchema,
    boardType: 'standard' satisfies StandardBoard['boardType'],
    cardStateSchema: authoritativeCardStateSchema,
    roundStateSchema: standardRoundStateSchema,
  },
);

type StandardAuthoritativeGameStateSchemaType = z.infer<
  typeof _standardAuthoritativeGameStateSchemaObject
>;

const _assertExactStandardAuthoritativeGameState: AssertExact<
  GameStateForBoard<StandardBoard, 'authoritative'>,
  StandardAuthoritativeGameStateSchemaType
> = true;

export const standardAuthoritativeGameStateSchema: z.ZodType<
  GameStateForBoard<StandardBoard, 'authoritative'>
> = _standardAuthoritativeGameStateSchemaObject;

const _standardWhiteSeenGameStateSchemaObject = createGameStateSchemaObject({
  boardSchema: standardBoardSchema,
  boardType: 'standard' satisfies StandardBoard['boardType'],
  cardStateSchema: whiteSeenCardStateSchema,
  roundStateSchema: standardRoundStateSchema,
});

type StandardWhiteSeenGameStateSchemaType = z.infer<
  typeof _standardWhiteSeenGameStateSchemaObject
>;

const _assertExactStandardWhiteSeenGameState: AssertExact<
  GameStateForBoard<StandardBoard, 'whiteSeen'>,
  StandardWhiteSeenGameStateSchemaType
> = true;

export const standardWhiteSeenGameStateSchema: z.ZodType<
  GameStateForBoard<StandardBoard, 'whiteSeen'>
> = _standardWhiteSeenGameStateSchemaObject;

const _standardBlackSeenGameStateSchemaObject = createGameStateSchemaObject({
  boardSchema: standardBoardSchema,
  boardType: 'standard' satisfies StandardBoard['boardType'],
  cardStateSchema: blackSeenCardStateSchema,
  roundStateSchema: standardRoundStateSchema,
});

type StandardBlackSeenGameStateSchemaType = z.infer<
  typeof _standardBlackSeenGameStateSchemaObject
>;

const _assertExactStandardBlackSeenGameState: AssertExact<
  GameStateForBoard<StandardBoard, 'blackSeen'>,
  StandardBlackSeenGameStateSchemaType
> = true;

export const standardBlackSeenGameStateSchema: z.ZodType<
  GameStateForBoard<StandardBoard, 'blackSeen'>
> = _standardBlackSeenGameStateSchemaObject;

const _standardGameStateSchemaObject = z.union([
  _standardAuthoritativeGameStateSchemaObject,
  _standardWhiteSeenGameStateSchemaObject,
  _standardBlackSeenGameStateSchemaObject,
]);

/** Any standard-board game state (all visibility regimes). */
export const standardGameStateSchema: z.ZodType<
  GameStateForBoard<StandardBoard, GameStateVisibility>
> = _standardGameStateSchemaObject;

// --- Large -----------------------------------------------------------------

const _largeAuthoritativeGameStateSchemaObject = createGameStateSchemaObject({
  boardSchema: largeBoardSchema,
  boardType: 'large' satisfies LargeBoard['boardType'],
  cardStateSchema: authoritativeCardStateSchema,
  roundStateSchema: largeRoundStateSchema,
});

type LargeAuthoritativeGameStateSchemaType = z.infer<
  typeof _largeAuthoritativeGameStateSchemaObject
>;

const _assertExactLargeAuthoritativeGameState: AssertExact<
  GameStateForBoard<LargeBoard, 'authoritative'>,
  LargeAuthoritativeGameStateSchemaType
> = true;

export const largeAuthoritativeGameStateSchema: z.ZodType<
  GameStateForBoard<LargeBoard, 'authoritative'>
> = _largeAuthoritativeGameStateSchemaObject;

const _largeWhiteSeenGameStateSchemaObject = createGameStateSchemaObject({
  boardSchema: largeBoardSchema,
  boardType: 'large' satisfies LargeBoard['boardType'],
  cardStateSchema: whiteSeenCardStateSchema,
  roundStateSchema: largeRoundStateSchema,
});

type LargeWhiteSeenGameStateSchemaType = z.infer<
  typeof _largeWhiteSeenGameStateSchemaObject
>;

const _assertExactLargeWhiteSeenGameState: AssertExact<
  GameStateForBoard<LargeBoard, 'whiteSeen'>,
  LargeWhiteSeenGameStateSchemaType
> = true;

export const largeWhiteSeenGameStateSchema: z.ZodType<
  GameStateForBoard<LargeBoard, 'whiteSeen'>
> = _largeWhiteSeenGameStateSchemaObject;

const _largeBlackSeenGameStateSchemaObject = createGameStateSchemaObject({
  boardSchema: largeBoardSchema,
  boardType: 'large' satisfies LargeBoard['boardType'],
  cardStateSchema: blackSeenCardStateSchema,
  roundStateSchema: largeRoundStateSchema,
});

type LargeBlackSeenGameStateSchemaType = z.infer<
  typeof _largeBlackSeenGameStateSchemaObject
>;

const _assertExactLargeBlackSeenGameState: AssertExact<
  GameStateForBoard<LargeBoard, 'blackSeen'>,
  LargeBlackSeenGameStateSchemaType
> = true;

export const largeBlackSeenGameStateSchema: z.ZodType<
  GameStateForBoard<LargeBoard, 'blackSeen'>
> = _largeBlackSeenGameStateSchemaObject;

const _largeGameStateSchemaObject = z.union([
  _largeAuthoritativeGameStateSchemaObject,
  _largeWhiteSeenGameStateSchemaObject,
  _largeBlackSeenGameStateSchemaObject,
]);

/** Any large-board game state (all visibility regimes). */
export const largeGameStateSchema: z.ZodType<
  GameStateForBoard<LargeBoard, GameStateVisibility>
> = _largeGameStateSchemaObject;

/** Any authoritative game state across board sizes. */
export const authoritativeGameStateSchema: z.ZodType<
  GameStateForVisibility<'authoritative'>
> = z.union([
  _smallAuthoritativeGameStateSchemaObject,
  _standardAuthoritativeGameStateSchemaObject,
  _largeAuthoritativeGameStateSchemaObject,
]);

/** Any white-seen game state across board sizes. */
export const whiteSeenGameStateSchema: z.ZodType<
  GameStateForVisibility<'whiteSeen'>
> = z.union([
  _smallWhiteSeenGameStateSchemaObject,
  _standardWhiteSeenGameStateSchemaObject,
  _largeWhiteSeenGameStateSchemaObject,
]);

/** Any black-seen game state across board sizes. */
export const blackSeenGameStateSchema: z.ZodType<
  GameStateForVisibility<'blackSeen'>
> = z.union([
  _smallBlackSeenGameStateSchemaObject,
  _standardBlackSeenGameStateSchemaObject,
  _largeBlackSeenGameStateSchemaObject,
]);

// --- Wide union ------------------------------------------------------------

/**
 * Wide schema: flat union of all board × visibility variants.
 * Per-variant AssertExact above; wide union not asserted.
 */
const _gameStateSchemaObject = z.union([
  _smallAuthoritativeGameStateSchemaObject,
  _smallWhiteSeenGameStateSchemaObject,
  _smallBlackSeenGameStateSchemaObject,
  _standardAuthoritativeGameStateSchemaObject,
  _standardWhiteSeenGameStateSchemaObject,
  _standardBlackSeenGameStateSchemaObject,
  _largeAuthoritativeGameStateSchemaObject,
  _largeWhiteSeenGameStateSchemaObject,
  _largeBlackSeenGameStateSchemaObject,
]);

export const gameStateSchema: z.ZodType<GameState> = _gameStateSchemaObject;
