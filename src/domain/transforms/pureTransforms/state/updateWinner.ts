import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

/**
 * Creates a new game state with the game winner assigned.
 *
 * @param state - The current game state
 * @param winner - The winning side; every ending names one (§11.3)
 * @returns A new game state with {@link GameState.winner} set
 */
export function updateWinner<S extends GameState>(
  state: S,
  winner: PlayerSide,
): S {
  // The battle is over and this side has prevailed. Why it ended (an empty
  // hand, a cost the loser could not survive, no units left) is the
  // caller's to have decided (§11).
  const withWinner: S = {
    ...state,
    winner,
  };

  // The state with the winner named.
  return withWinner;
}
