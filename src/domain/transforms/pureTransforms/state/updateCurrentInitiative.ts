import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

/**
 * Creates a new game state with the current initiative player updated.
 *
 * @param state - The current game state
 * @param player - The side that has initiative for the round
 * @returns A new game state with the updated initiative
 */
export function updateCurrentInitiative(
  state: GameState,
  player: PlayerSide,
): GameState {
  return {
    ...state,
    currentInitiative: player,
  };
}
