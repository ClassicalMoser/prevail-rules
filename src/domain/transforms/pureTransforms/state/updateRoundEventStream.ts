import type { Event } from '@events';
import type { GameStateForVisibility, GameStateVisibility } from '@game';

/**
 * Sets the current round's ordered event log (replay tail, tests, or harness state).
 * Does not append; replaces `currentRoundState.events` with the given array.
 *
 * @param state - The current game state
 * @param events - The full event stream for the round to store
 * @returns A new game state with the updated round event stream
 */
export function updateRoundEventStream<V extends GameStateVisibility>(
  state: GameStateForVisibility<V>,
  events: readonly Event[],
): GameStateForVisibility<V> {
  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      events,
    },
  };
}
