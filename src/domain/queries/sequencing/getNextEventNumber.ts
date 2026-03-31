import type { Board } from '@entities';
import type { GameState } from '@game';
import { getCurrentEventStream } from './getCurrentEventStream';

/**
 * Gets the next event number for the given game state.
 *
 * @param gameState - The game state
 * @returns The next event number
 */
export function getNextEventNumber<TBoard extends Board>(
  gameState: GameState<TBoard>,
): number {
  const eventStream = getCurrentEventStream(gameState);
  return eventStream.length;
}
