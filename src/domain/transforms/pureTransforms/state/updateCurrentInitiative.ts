import type { Board, PlayerSide } from "@entities";
import type { GameStateWithBoard } from "@game";

/**
 * Creates a new game state with the current initiative player updated.
 *
 * @param state - The current game state
 * @param player - The side that has initiative for the round
 * @returns A new game state with the updated initiative
 */
export function updateCurrentInitiative<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
  player: PlayerSide,
): GameStateWithBoard<TBoard> {
  return {
    ...state,
    currentInitiative: player,
  };
}
