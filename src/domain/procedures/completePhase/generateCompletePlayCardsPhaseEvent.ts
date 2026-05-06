import type { CompletePlayCardsPhaseEvent } from "@events";
import type { GameState } from "@game";
import { COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE, GAME_EFFECT_EVENT_TYPE } from "@events";

/**
 * Generates a CompletePlayCardsPhaseEvent to complete the play cards phase
 * and advance to move commanders phase.
 *
 * @param state - The current game state
 * @returns A complete CompletePlayCardsPhaseEvent
 */
export function generateCompletePlayCardsPhaseEvent(
  state: GameState,
  eventNumber: number,
): CompletePlayCardsPhaseEvent {
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
    eventNumber,
  };
}
