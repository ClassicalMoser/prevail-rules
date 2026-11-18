import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the game over game effect. */
export const GAME_OVER_EFFECT_TYPE = 'gameOver' as const;

/**
 * The game ends, and the winner is recorded. A player loses when their hand
 * is empty (§11.1), when they are expected to discard at least as many cards
 * as they have (§11.2), or when they have no units left on the board
 * (§11.4). Every ending names a winner — there is no draw in this game: both
 * hands emptying at once goes to the holder of initiative (§11.3).
 *
 * `generateGameOverEvent` writes it, and `applyGameOverEvent` applies it.
 */
export interface GameOverEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof GAME_OVER_EFFECT_TYPE;
  /** The player who won. */
  winner: PlayerSide;
}

const _gameOverEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(GAME_OVER_EFFECT_TYPE),
    /** The player who won. */
    winner: playerSideSchema,
  })
  .strict();

type GameOverEventSchemaType = z.infer<typeof _gameOverEventSchemaObject>;

const _assertExactGameOverEvent: AssertExact<
  GameOverEvent,
  GameOverEventSchemaType
> = true;

/** The schema for a game over event. */
export const gameOverEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'gameOver'>;
  winner: typeof playerSideSchema;
}> = _gameOverEventSchemaObject;
