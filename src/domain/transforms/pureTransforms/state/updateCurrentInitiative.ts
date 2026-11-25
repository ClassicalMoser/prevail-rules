import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

/**
 * Creates a new game state with the current initiative player updated.
 *
 * @param state - The current game state
 * @param player - The side that has initiative for the round
 * @returns A new game state with the updated initiative
 */
export function updateCurrentInitiative<S extends GameState>(
  state: S,
  player: PlayerSide,
): S {
  // The side holding the initiative is the first player for the round and
  // acts first in every phase with an order (§4.1.5). Who wins it is the
  // caller's to have decided: the lower card, or the holder on a tie
  // (§4.1.3, §4.1.4).
  const withInitiative: S = {
    ...state,
    currentInitiative: player,
  };

  // The state with that side holding the initiative.
  return withInitiative;
}
