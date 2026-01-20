import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { DISCARD_PLAYED_CARDS_EFFECT_TYPE } from './gameEffect';

/**
 * Event to discard played cards.
 * Moves both players' cards from inPlay to discard pile.
 * This is the first step of the cleanup phase.
 */
export interface DiscardPlayedCardsEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof DISCARD_PLAYED_CARDS_EFFECT_TYPE;
}

const _discardPlayedCardsEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(DISCARD_PLAYED_CARDS_EFFECT_TYPE),
});

type DiscardPlayedCardsEventSchemaType = z.infer<
  typeof _discardPlayedCardsEventSchemaObject
>;

const _assertExactDiscardPlayedCardsEvent: AssertExact<
  DiscardPlayedCardsEvent,
  DiscardPlayedCardsEventSchemaType
> = true;

/** The schema for a discard played cards event. */
export const discardPlayedCardsEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof DISCARD_PLAYED_CARDS_EFFECT_TYPE>;
}> = _discardPlayedCardsEventSchemaObject;
