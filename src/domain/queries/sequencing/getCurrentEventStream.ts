import type { ProjectedEvent } from '@events';
import type { GameState } from '@game';

/**
 * Gets the current event stream for the given game state, as that view holds
 * it: every event as made on the server, and as received on a seat.
 *
 * @param state - The game state
 * @returns The current event stream
 */
export function getCurrentEventStream(
  state: GameState,
): readonly ProjectedEvent[] {
  const events = state.currentRoundState.events;
  return events;
}
