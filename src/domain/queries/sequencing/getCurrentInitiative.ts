import type { PlayerSide } from "@entities";
import type { GameState } from "@game";

/**
 * Gets which player currently has initiative.
 *
 * @param state - The game state
 * @returns The player side with initiative
 */
export function getCurrentInitiative(state: GameState): PlayerSide {
  return state.currentInitiative;
}
