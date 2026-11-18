import type { GameModeName } from '@entities';
import type { Event, ProjectedEvent } from '@events';
import type { AssertExact } from '@utils';
import type {
  AuthoritativeGameState,
  BlackSeenGameState,
  SpectatorGameState,
  WhiteSeenGameState,
} from '@game/gameState';

import { gameModeNames } from '@entities';
import { eventSchema, projectedEventSchema } from '@events';
import { z } from 'zod';
import {
  authoritativeGameStateSchema,
  blackSeenGameStateSchema,
  spectatorGameStateSchema,
  whiteSeenGameStateSchema,
} from '@game/gameState';

/**
 * A {@link Game} as one viewer may see it, so a client can join or resync
 * without being sent anything it may not read.
 *
 * The armies are left out: each army lists its command cards, and those are
 * the hand it brings to battle, and hands are secret (§1.4).
 * Instead the game carries the state it opened on, in this view. Replaying
 * `events` from `openingState` gives every state this viewer has seen, and
 * `gameState` is the latest of them, kept so the client need not replay.
 *
 * `visibility` names the view, and fixes the view of both states, so the
 * three cannot disagree. `projectGameForVisibility` in `@transforms` builds one.
 *
 * The board is sent whole: every view reads it in full, since all information
 * on the board is open (§1.4). Hidden stands (§3.6) are not built yet; when
 * they are, the opening state and the board will need hiding per view too.
 */
export type ProjectedGame =
  | AuthoritativeProjectedGame
  | WhiteSeenProjectedGame
  | BlackSeenProjectedGame
  | SpectatorProjectedGame;

/**
 * The full record with nothing hidden, for a viewer allowed to see every card:
 * a watcher of a game between two bots, where no seat is a person to hide from.
 */
export interface AuthoritativeProjectedGame {
  /** The view this game is. */
  visibility: 'authoritative';
  /** The unique identifier of the game. */
  id: string;
  /** The mode being played, which sets the board and the army limits (§3.1.3). */
  gameMode: GameModeName;
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: string;
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: string;
  /** The state the game opened on: armies in reserve, hands dealt. */
  openingState: AuthoritativeGameState;
  /** Every event of the game, in order, with nothing hidden. */
  events: readonly Event[];
  /** The latest state, which replaying `events` from `openingState` reaches. */
  gameState: AuthoritativeGameState;
}

/** The game as white's seat sees it: black's cards face down. */
export interface WhiteSeenProjectedGame {
  /** The view this game is. */
  visibility: 'whiteSeen';
  /** The unique identifier of the game. */
  id: string;
  /** The mode being played, which sets the board and the army limits (§3.1.3). */
  gameMode: GameModeName;
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: string;
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: string;
  /** The state the game opened on, black's hand face down. */
  openingState: WhiteSeenGameState;
  /** Every event of the game, in order, the card black chose face down. */
  events: readonly ProjectedEvent[];
  /** The latest state, which replaying `events` from `openingState` reaches. */
  gameState: WhiteSeenGameState;
}

/** The game as black's seat sees it: white's cards face down. */
export interface BlackSeenProjectedGame {
  /** The view this game is. */
  visibility: 'blackSeen';
  /** The unique identifier of the game. */
  id: string;
  /** The mode being played, which sets the board and the army limits (§3.1.3). */
  gameMode: GameModeName;
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: string;
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: string;
  /** The state the game opened on, white's hand face down. */
  openingState: BlackSeenGameState;
  /** Every event of the game, in order, the card white chose face down. */
  events: readonly ProjectedEvent[];
  /** The latest state, which replaying `events` from `openingState` reaches. */
  gameState: BlackSeenGameState;
}

/** The game as a spectator sees it: both hands face down. */
export interface SpectatorProjectedGame {
  /** The view this game is. */
  visibility: 'spectator';
  /** The unique identifier of the game. */
  id: string;
  /** The mode being played, which sets the board and the army limits (§3.1.3). */
  gameMode: GameModeName;
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: string;
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: string;
  /** The state the game opened on, both hands face down. */
  openingState: SpectatorGameState;
  /** Every event of the game, in order, both chosen cards face down. */
  events: readonly ProjectedEvent[];
  /** The latest state, which replaying `events` from `openingState` reaches. */
  gameState: SpectatorGameState;
}

const _authoritativeProjectedGameSchemaObject: z.ZodObject<{
  visibility: z.ZodLiteral<'authoritative'>;
  id: z.ZodUUID;
  gameMode: z.ZodEnum<{ [K in GameModeName]: K }>;
  whitePlayer: z.ZodUUID;
  blackPlayer: z.ZodUUID;
  openingState: typeof authoritativeGameStateSchema;
  events: z.ZodReadonly<z.ZodArray<z.ZodType<Event>>>;
  gameState: typeof authoritativeGameStateSchema;
}> = z
  .object({
    blackPlayer: z.uuid(),
    events: z.array(eventSchema).readonly(),
    gameMode: z.enum(gameModeNames),
    gameState: authoritativeGameStateSchema,
    id: z.uuid(),
    openingState: authoritativeGameStateSchema,
    visibility: z.literal('authoritative'),
    whitePlayer: z.uuid(),
  })
  .strict();

const _whiteSeenProjectedGameSchemaObject: z.ZodObject<{
  visibility: z.ZodLiteral<'whiteSeen'>;
  id: z.ZodUUID;
  gameMode: z.ZodEnum<{ [K in GameModeName]: K }>;
  whitePlayer: z.ZodUUID;
  blackPlayer: z.ZodUUID;
  openingState: typeof whiteSeenGameStateSchema;
  events: z.ZodReadonly<z.ZodArray<z.ZodType<ProjectedEvent>>>;
  gameState: typeof whiteSeenGameStateSchema;
}> = z
  .object({
    blackPlayer: z.uuid(),
    events: z.array(projectedEventSchema).readonly(),
    gameMode: z.enum(gameModeNames),
    gameState: whiteSeenGameStateSchema,
    id: z.uuid(),
    openingState: whiteSeenGameStateSchema,
    visibility: z.literal('whiteSeen'),
    whitePlayer: z.uuid(),
  })
  .strict();

const _blackSeenProjectedGameSchemaObject: z.ZodObject<{
  visibility: z.ZodLiteral<'blackSeen'>;
  id: z.ZodUUID;
  gameMode: z.ZodEnum<{ [K in GameModeName]: K }>;
  whitePlayer: z.ZodUUID;
  blackPlayer: z.ZodUUID;
  openingState: typeof blackSeenGameStateSchema;
  events: z.ZodReadonly<z.ZodArray<z.ZodType<ProjectedEvent>>>;
  gameState: typeof blackSeenGameStateSchema;
}> = z
  .object({
    blackPlayer: z.uuid(),
    events: z.array(projectedEventSchema).readonly(),
    gameMode: z.enum(gameModeNames),
    gameState: blackSeenGameStateSchema,
    id: z.uuid(),
    openingState: blackSeenGameStateSchema,
    visibility: z.literal('blackSeen'),
    whitePlayer: z.uuid(),
  })
  .strict();

const _spectatorProjectedGameSchemaObject: z.ZodObject<{
  visibility: z.ZodLiteral<'spectator'>;
  id: z.ZodUUID;
  gameMode: z.ZodEnum<{ [K in GameModeName]: K }>;
  whitePlayer: z.ZodUUID;
  blackPlayer: z.ZodUUID;
  openingState: typeof spectatorGameStateSchema;
  events: z.ZodReadonly<z.ZodArray<z.ZodType<ProjectedEvent>>>;
  gameState: typeof spectatorGameStateSchema;
}> = z
  .object({
    blackPlayer: z.uuid(),
    events: z.array(projectedEventSchema).readonly(),
    gameMode: z.enum(gameModeNames),
    gameState: spectatorGameStateSchema,
    id: z.uuid(),
    openingState: spectatorGameStateSchema,
    visibility: z.literal('spectator'),
    whitePlayer: z.uuid(),
  })
  .strict();

const _projectedGameSchemaObject = z.discriminatedUnion('visibility', [
  _authoritativeProjectedGameSchemaObject,
  _whiteSeenProjectedGameSchemaObject,
  _blackSeenProjectedGameSchemaObject,
  _spectatorProjectedGameSchemaObject,
]);

type AuthoritativeProjectedGameSchemaType = z.infer<
  typeof _authoritativeProjectedGameSchemaObject
>;
type WhiteSeenProjectedGameSchemaType = z.infer<
  typeof _whiteSeenProjectedGameSchemaObject
>;
type BlackSeenProjectedGameSchemaType = z.infer<
  typeof _blackSeenProjectedGameSchemaObject
>;
type SpectatorProjectedGameSchemaType = z.infer<
  typeof _spectatorProjectedGameSchemaObject
>;
type ProjectedGameSchemaType = z.infer<typeof _projectedGameSchemaObject>;

/** Schema for {@link AuthoritativeProjectedGame}. */
export const authoritativeProjectedGameSchema: typeof _authoritativeProjectedGameSchemaObject =
  _authoritativeProjectedGameSchemaObject;

/** Schema for {@link WhiteSeenProjectedGame}. */
export const whiteSeenProjectedGameSchema: typeof _whiteSeenProjectedGameSchemaObject =
  _whiteSeenProjectedGameSchemaObject;

/** Schema for {@link BlackSeenProjectedGame}. */
export const blackSeenProjectedGameSchema: typeof _blackSeenProjectedGameSchemaObject =
  _blackSeenProjectedGameSchemaObject;

/** Schema for {@link SpectatorProjectedGame}. */
export const spectatorProjectedGameSchema: typeof _spectatorProjectedGameSchemaObject =
  _spectatorProjectedGameSchemaObject;

/** Schema for {@link ProjectedGame}, any view. */
export const projectedGameSchema: z.ZodType<ProjectedGame> =
  _projectedGameSchemaObject;

const _assertAuthoritativeProjectedGame: AssertExact<
  AuthoritativeProjectedGame,
  AuthoritativeProjectedGameSchemaType
> = true;
const _assertWhiteSeenProjectedGame: AssertExact<
  WhiteSeenProjectedGame,
  WhiteSeenProjectedGameSchemaType
> = true;
const _assertBlackSeenProjectedGame: AssertExact<
  BlackSeenProjectedGame,
  BlackSeenProjectedGameSchemaType
> = true;
const _assertSpectatorProjectedGame: AssertExact<
  SpectatorProjectedGame,
  SpectatorProjectedGameSchemaType
> = true;
const _assertProjectedGame: AssertExact<
  ProjectedGame,
  ProjectedGameSchemaType
> = true;
