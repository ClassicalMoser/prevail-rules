import type { Board, PlayerSide } from '@entities';
import type { GameState } from '@game';

/* Pure transform to add a commander to the lost commanders set immutably with no side effects. */
export function addCommanderToLostCommanders<TBoard extends Board>(
  gameState: GameState<TBoard>,
  playerSide: PlayerSide,
): GameState<TBoard> {
  if (gameState.lostCommanders.has(playerSide)) {
    throw new Error('Commander already lost');
  }
  const newLostCommanders = new Set([...gameState.lostCommanders, playerSide]);
  return {
    ...gameState,
    lostCommanders: newLostCommanders,
  };
}
