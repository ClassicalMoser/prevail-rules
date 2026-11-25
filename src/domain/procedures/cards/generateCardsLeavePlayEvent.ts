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
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    effectType: CARDS_LEAVE_PLAY_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
}
