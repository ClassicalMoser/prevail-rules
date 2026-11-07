import type { PlayerSide } from '@entities';
import type { GameState, RoutState } from '@game';
import { findRoutLocation } from './findRoutLocation';

/**
 * The rout this player owes cards for, or `undefined` when they are not
 * routing.
 *
 * This is `findRoutLocation` for a caller that needs the rout and not the
 * parent holding it, which is most of them: only `resolveRout` has to name the
 * parent it will write back to.
 *
 * Nothing routing is an ordinary state — most of a game has no rout open — so
 * this answers rather than throwing. Callers that know a rout must be there use
 * `getRoutState`.
 *
 * @param state - The game state
 * @param player - The player whose rout to find
 * @returns That player's rout, or `undefined` when they have none
 */
export function findRoutState(
  state: GameState,
  player: PlayerSide,
): RoutState | undefined {
  const location = findRoutLocation(state, player);
  if (location === undefined) {
    return undefined;
  }
  const routState = location.routState;
  return routState;
}
