import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the discard played cards game effect. */
export const DISCARD_PLAYED_CARDS_EFFECT_TYPE = 'discardPlayedCards' as const;

/**
 * Event to discard played cards.
 * Moves both players' cards from inPlay to discard pile.
 * TODO(misleading): the card in play goes to the played pile, not the
 * discard pile (§4.5.1), as `moveBothInPlayToPlayed` does. Settled by naming
 * the played pile.
 * This is the first step of the cleanup phase.
 */
export interface DiscardPlayedCardsEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof DISCARD_PLAYED_CARDS_EFFECT_TYPE;
}

const _discardPlayedCardsEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(DISCARD_PLAYED_CARDS_EFFECT_TYPE),
  })
  .strict();

type DiscardPlayedCardsEventSchemaType = z.infer<
  typeof _discardPlayedCardsEventSchemaObject
>;

const _assertExactDiscardPlayedCardsEvent: AssertExact<
  DiscardPlayedCardsEvent,
  DiscardPlayedCardsEventSchemaType
> = true;

/** The schema for a discard played cards event. */
export const discardPlayedCardsEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'discardPlayedCards'>;
}> = _discardPlayedCardsEventSchemaObject;
