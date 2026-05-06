import type { Board, PlayerSide } from "@entities";
import type { GameStateForBoard } from "@game";

/* Pure transform to add a commander to the lost commanders set immutably with no side effects. */
export function addCommanderToLostCommanders<TBoard extends Board>(
  gameState: GameStateForBoard<TBoard>,
  playerSide: PlayerSide,
): GameStateForBoard<TBoard> {
  if (gameState.lostCommanders.has(playerSide)) {
    throw new Error("Commander already lost");
  }
  const newLostCommanders = new Set([...gameState.lostCommanders, playerSide]);
  return {
    ...gameState,
    lostCommanders: newLostCommanders,
  };
}
