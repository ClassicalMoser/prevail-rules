import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { deriveGameStateIndex } from '@queries';

/**
 * Records a side's commander as lost with a routing unit (§4.2.8): out of the
 * game for good. The index, set afresh from the record, follows.
 *
 * @param gameState - The game as the commander falls
 * @param playerSide - The side whose commander is lost
 * @returns The state with the commander among the lost, and its index
 * @throws When that commander is already lost
 */
export function addCommanderToLostCommanders<S extends GameState>(
  gameState: S,
  playerSide: PlayerSide,
): S {
  // A commander is lost once; it is out of the game after that.
  if (gameState.lostCommanders.includes(playerSide)) {
    throw new Error('Commander already lost');
  }

  // The lost commanders with this one added.
  const withLost: S = {
    ...gameState,
    lostCommanders: [...gameState.lostCommanders, playerSide],
  };

  // Where every piece now is, read from the record just written.
  const updated: S = {
    ...withLost,
    index: deriveGameStateIndex(withLost),
  };
  return updated;
}
