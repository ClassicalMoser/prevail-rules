import type { CardsLeavePlayEvent } from '@events';
import { CARDS_LEAVE_PLAY_EFFECT_TYPE, GAME_EFFECT_EVENT_TYPE } from '@events';

/**
 * Generates a CardsLeavePlayEvent, the first step of Cleanup: both cards in
 * play go to their owners' played piles. Which cards are in play is the
 * state's, so the event carries nothing.
 *
 * @returns A complete CardsLeavePlayEvent
 */
export function generateCardsLeavePlayEvent(): CardsLeavePlayEvent {
  // Both cards in play go to their owners' played piles at the start of
  // Cleanup (§4.5.1). That is fixed: there is nothing to measure or draw, and
  // the apply reads which cards are in play from the state itself.
  const cardsLeavePlay: CardsLeavePlayEvent = {
    effectType: CARDS_LEAVE_PLAY_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The effect that clears both cards from play before the rallies.
  return cardsLeavePlay;
}
