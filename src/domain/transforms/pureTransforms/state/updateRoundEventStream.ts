import type { Board } from '@entities';
import type { Event } from '@events';
import type { GameState } from '@game';

/**
 * Sets the current round's ordered event log (replay tail, tests, or harness state).
 * Does not append; replaces `currentRoundState.events` with the given array.
 *
 * @param state - The current game state
 * @param events - The full event stream for the round to store
 * @returns A new game state with the updated round event stream
 */
export function updateRoundEventStream<TBoard extends Board>(
  state: GameState<TBoard>,
  events: readonly Event<TBoard>[],
): GameState<TBoard> {
  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      events,
    },
  };
}
