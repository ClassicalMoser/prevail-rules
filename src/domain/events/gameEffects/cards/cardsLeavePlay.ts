import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the cards-leave-play game effect. */
export const CARDS_LEAVE_PLAY_EFFECT_TYPE = 'cardsLeavePlay' as const;

/**
 * The first step of Cleanup: both players' cards in play go to their played
 * piles (§4.5.1). A card stays there until its owner rallies.
 *
 * `generateCardsLeavePlayEvent` writes it, and `applyCardsLeavePlayEvent` applies it.
 */
export interface CardsLeavePlayEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof CARDS_LEAVE_PLAY_EFFECT_TYPE;
}

const _cardsLeavePlayEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(CARDS_LEAVE_PLAY_EFFECT_TYPE),
  })
  .strict();

type CardsLeavePlayEventSchemaType = z.infer<
  typeof _cardsLeavePlayEventSchemaObject
>;

const _assertExactCardsLeavePlayEvent: AssertExact<
  CardsLeavePlayEvent,
  CardsLeavePlayEventSchemaType
> = true;

/** The schema for a cards-leave-play event. */
export const cardsLeavePlayEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'cardsLeavePlay'>;
}> = _cardsLeavePlayEventSchemaObject;
