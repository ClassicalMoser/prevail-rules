import type { Event } from '@events';
import type { GameState } from '@game';

/**
 * Gets the current event stream for the given game state.
 *
 * @param state - The game state
 * @returns The current event stream
 */
export function getCurrentEventStream(state: GameState): readonly Event[] {
  return state.currentRoundState.events;
}
