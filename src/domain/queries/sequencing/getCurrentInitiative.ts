import type { Board, PlayerSide } from "@entities";
import type { GameStateWithBoard } from "@game";

/**
 * Gets which player currently has initiative.
 *
 * @param state - The game state
 * @returns The player side with initiative
 */
export function getCurrentInitiative<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
): PlayerSide {
  return state.currentInitiative;
}
