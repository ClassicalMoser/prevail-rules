import type { RoundEndEvent } from '@events';
import type { GameState } from '@game';
import { ROUND_END_EFFECT_TYPE, GAME_EFFECT_EVENT_TYPE } from '@events';

/**
 * Generates a RoundEndEvent to complete the cleanup phase,
 * advance round, and reset to play cards phase.
 *
 * @param state - The current game state
 * @returns A complete RoundEndEvent
 */
export function generateRoundEndEvent(state: GameState): RoundEndEvent {
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    effectType: ROUND_END_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
}
