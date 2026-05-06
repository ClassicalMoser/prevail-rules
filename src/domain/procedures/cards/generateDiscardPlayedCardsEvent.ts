import type { DiscardPlayedCardsEvent } from "@events";
import type { GameState } from "@game";
import { DISCARD_PLAYED_CARDS_EFFECT_TYPE, GAME_EFFECT_EVENT_TYPE } from "@events";

/**
 * Generates a DiscardPlayedCardsEvent to discard all played cards.
 * This is the first step of the cleanup phase.
 *
 * @param state - The current game state
 * @returns A complete DiscardPlayedCardsEvent
 */
export function generateDiscardPlayedCardsEvent(
  state: GameState,
  eventNumber: number,
): DiscardPlayedCardsEvent {
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: DISCARD_PLAYED_CARDS_EFFECT_TYPE,
    eventNumber,
  };
}
