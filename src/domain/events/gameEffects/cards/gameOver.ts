import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the game over game effect. */
export const GAME_OVER_EFFECT_TYPE = 'gameOver' as const;

/**
 * Event that ends the game and records the winner.
 * Every ending names a winner — there is no draw in this game: both hands
 * emptying at once goes to the holder of initiative (§11.3).
 */
export interface GameOverEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof GAME_OVER_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The winning player. */
  winner: PlayerSide;
}

const _gameOverEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(GAME_OVER_EFFECT_TYPE),
    /** The ordered index of the event in the round, zero-indexed. */
    eventNumber: z.number(),
    /** The winning player. */
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
  eventNumber: z.ZodNumber;
  winner: typeof playerSideSchema;
}> = _gameOverEventSchemaObject;
