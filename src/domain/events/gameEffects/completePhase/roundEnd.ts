import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/**
 * Literal for {@link RoundEndEvent.effectType}. The round ends: the cleanup phase
 * completes, the round advances, and the play-cards phase of the next begins. Payload is only
 * discriminators—transition details come from pure transforms + current state.
 */
export const ROUND_END_EFFECT_TYPE = 'roundEnd' as const;

/** Ends the round: completes the cleanup phase, advances the round, and begins the next round's play-cards phase. */
export interface RoundEndEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof ROUND_END_EFFECT_TYPE;
}

const _roundEndEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(ROUND_END_EFFECT_TYPE),
  })
  .strict();

type RoundEndEventSchemaType = z.infer<typeof _roundEndEventSchemaObject>;

const _assertExactRoundEndEvent: AssertExact<
  RoundEndEvent,
  RoundEndEventSchemaType
> = true;

/** The schema for a round end event. */
export const roundEndEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'roundEnd'>;
}> = _roundEndEventSchemaObject;
