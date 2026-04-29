import type { Board, PlayerSide } from "@entities";
import type { GameStateWithBoard } from "@game";

/* Pure transform to add a commander to the lost commanders set immutably with no side effects. */
export function addCommanderToLostCommanders<TBoard extends Board>(
  gameState: GameStateWithBoard<TBoard>,
  playerSide: PlayerSide,
): GameStateWithBoard<TBoard> {
  if (gameState.lostCommanders.has(playerSide)) {
    throw new Error("Commander already lost");
  }
  const newLostCommanders = new Set([...gameState.lostCommanders, playerSide]);
  return {
    ...gameState,
    lostCommanders: newLostCommanders,
  };
}
