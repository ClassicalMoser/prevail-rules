import type { Board } from "@entities";
import type { Event, EventType } from "@events";
import type { GameStateWithBoard } from "@game";

/**
 * Gets the current event stream for the given game state.
 *
 * @param state - The game state
 * @returns The current event stream
 */
export function getCurrentEventStream<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
): readonly Event<Board, EventType>[] {
  return state.currentRoundState.events;
}
