import type { PlayerSide } from '@entities';
import type { GameState, RoutState } from '@game';
import { findRoutState } from './findRoutState';

/**
 * The rout this player owes cards for, for a caller that knows there is one.
 *
 * Every step that resolves a rout is sequenced after the rout was opened, so a
 * missing one there is a sequencing fault rather than a quiet state of the game.
 * Use `findRoutState` to ask whether the player is routing at all.
 *
 * @param state - The game state
 * @param player - The player whose rout to read
 * @returns That player's rout
 * @throws Error when that player is not routing
 */
export function getRoutState(state: GameState, player: PlayerSide): RoutState {
  const routState = findRoutState(state, player);
  if (routState === undefined) {
    throw new Error(`No rout is in play for ${player}`);
  }
  return routState;
}
