import type { Board, PlayerSide } from '@entities';
import type { GameState } from '@game';

/* Pure transform to add a commander to the lost commanders set immutably with no side effects. */
export function addCommanderToLostCommanders<TBoard extends Board>(
  gameState: GameState,
  playerSide: PlayerSide,
): GameState {
  if (gameState.lostCommanders.includes(playerSide)) {
    throw new Error('Commander already lost');
  }
  const newLostCommanders = [...gameState.lostCommanders, playerSide];
  return {
    ...gameState,
    lostCommanders: newLostCommanders,
  };
}
