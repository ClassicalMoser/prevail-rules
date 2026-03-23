import type { Board, GameState, PlayerSide } from '@entities';

/**
 * Creates a new game state with the current initiative player updated.
 *
 * @param state - The current game state
 * @param player - The side that has initiative for the round
 * @returns A new game state with the updated initiative
 */
export function updateCurrentInitiative<TBoard extends Board>(
  state: GameState<TBoard>,
  player: PlayerSide,
): GameState<TBoard> {
  return {
    ...state,
    currentInitiative: player,
  };
}
