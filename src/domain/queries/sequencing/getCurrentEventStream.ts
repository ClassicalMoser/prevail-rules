import type { Board } from "@entities";
import type { EventForBoard } from "@events";
import type { GameStateForBoard } from "@game";

/**
 * Gets the current event stream for the given game state.
 *
 * @param state - The game state
 * @returns The current event stream
 */
export function getCurrentEventStream<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
): readonly EventForBoard<TBoard>[] {
  return state.currentRoundState.events;
}
