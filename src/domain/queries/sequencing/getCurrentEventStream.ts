import type { Board } from '@entities';
import type { Event } from '@events';
import type { GameState } from '@game';

/**
 * Gets the current event stream for the given game state.
 *
 * @param state - The game state
 * @returns The current event stream
 */
export function getCurrentEventStream<TBoard extends Board>(
  state: GameState<TBoard>,
): readonly Event<TBoard>[] {
  return state.currentRoundState.events;
}
