import type { CompletePlayCardsPhaseEvent } from '@events';
import {
  COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompletePlayCardsPhaseEvent, ending Phase 1 and beginning
 * Phase 2. Who holds the initiative, and each player's card in play, are
 * the state's, so the event carries nothing.
 *
 * @returns A complete CompletePlayCardsPhaseEvent
 */
export function generateCompletePlayCardsPhaseEvent(): CompletePlayCardsPhaseEvent {
  // Both cards are face up and initiative is settled (§4.1.3, §4.1.4): who
  // holds it, and each player's card in play, are on the state, so nothing
  // is recorded. The commanders move next, the first player's first
  // (§4.2.1).
  const event: CompletePlayCardsPhaseEvent = {
    effectType: COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // Phase 1 ends, for the transform to open Move Commanders.
  return event;
}
