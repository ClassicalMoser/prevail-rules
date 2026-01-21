import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the discard played cards game effect. */
export const DISCARD_PLAYED_CARDS_EFFECT_TYPE = 'discardPlayedCards' as const;

/**
 * Event to discard played cards.
 * Moves both players' cards from inPlay to discard pile.
 * This is the first step of the cleanup phase.
 */
export interface DiscardPlayedCardsEvent<_TBoard extends Board> {
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
  DiscardPlayedCardsEvent<Board>,
  DiscardPlayedCardsEventSchemaType
> = true;

/** The schema for a discard played cards event. */
export const discardPlayedCardsEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'discardPlayedCards'>;
}> = _discardPlayedCardsEventSchemaObject;
