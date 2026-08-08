import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the game over game effect. */
export const GAME_OVER_EFFECT_TYPE = 'gameOver' as const;

/**
 * Event that ends the game and records the winner.
 * `winner` is null for a draw (both hands empty).
 */
export interface GameOverEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof GAME_OVER_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** Winning player, or null for a draw. */
  winner: PlayerSide | null;
}

const _gameOverEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(GAME_OVER_EFFECT_TYPE),
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: z.number(),
  /** Winning player, or null for a draw. */
  winner: playerSideSchema.nullable(),
});

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
  winner: z.ZodNullable<typeof playerSideSchema>;
}> = _gameOverEventSchemaObject;
