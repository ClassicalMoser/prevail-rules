import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

/**
 * Creates a new game state with the game winner assigned.
 *
 * @param state - The current game state
 * @param winner - Winning side, or null for a draw
 * @returns A new game state with {@link GameState.winner} set
 */
export function updateWinner<S extends GameState>(
  state: S,
  winner: PlayerSide | null,
): S {
  return {
    ...state,
    winner,
  };
}
