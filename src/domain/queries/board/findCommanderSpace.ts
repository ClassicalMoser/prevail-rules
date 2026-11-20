import type { Coordinate, PlayerSide } from '@entities';
import type { GameState } from '@game';

/**
 * Where a side's commander stands, or `undefined` when it is not on the
 * board: not yet placed at setup, or lost with a routing unit (§4.2.8).
 *
 * Read from the game state's index, which every write keeps in step with the
 * board, so the board is not searched.
 *
 * @param side - The side whose commander is wanted
 * @param gameState - The game, for its index
 * @returns The coordinate the commander stands on, or `undefined` when it is not on the board
 */
export function findCommanderSpace(
  side: PlayerSide,
  gameState: GameState,
): Coordinate | undefined {
  // Where the index files this side's commander.
  const entry = gameState.index.commanders[side];

  // Not yet placed, or lost: it stands nowhere.
  if (entry === 'reserved' || entry === 'lost') {
    return undefined;
  }

  // Otherwise the entry is the space it stands on.
  return entry;
}
