import type { CardsLeavePlayEvent } from '@events';
import type { GameState } from '@game';
import { CARDS_LEAVE_PLAY_EFFECT_TYPE, GAME_EFFECT_EVENT_TYPE } from '@events';

/**
 * Generates a CardsLeavePlayEvent to discard all played cards.
 * This is the first step of the cleanup phase.
 *
 * @param state - The current game state
 * @returns A complete CardsLeavePlayEvent
 */
export function generateCardsLeavePlayEvent(
  state: GameState,
): CardsLeavePlayEvent {
  // TODO(composition): the parameter is never read. Other fixed effects
  // (`generateCompleteMeleeResolutionEvent`, `generateCompleteUnitMovementEvent`)
  // take no state at all. Settle by dropping it here and in
  // `generateEventFromProcedure`, or by saying why this one keeps it.
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;

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
