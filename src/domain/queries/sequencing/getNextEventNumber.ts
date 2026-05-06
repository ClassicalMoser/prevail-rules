import type { GameState, GameStateForBoard } from "@game";
import { getCurrentEventStream } from "./getCurrentEventStream";
import { Board } from "@entities";

/**
 * Gets the next event number for the given game state.
 *
 * @param gameState - The game state
 * @returns The next event number
 */
export function getNextEventNumber(gameState: GameState): number {
  // Safe broadening used since the shape of the return is irrelevant to the function
  const eventStream = getCurrentEventStream(gameState as GameStateForBoard<Board>);
  return eventStream.length;
}
