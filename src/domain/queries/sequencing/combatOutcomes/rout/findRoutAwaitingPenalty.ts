import type { GameState } from '@game';
import { isPending } from '@utils';
import { getOtherPlayer } from '@queries/player';
import type { RoutLocation } from './findRoutLocation';
import { findRoutLocation } from './findRoutLocation';

/**
 * The rout whose penalty has not been worked out yet, with the parent
 * accountable for it.
 *
 * `resolveRout` fills the penalty in, and this is the rout it is due for. The
 * parent comes back with it, as `findRoutLocation` gives it.
 *
 * Both sides are asked after, the initiative player's first. That order
 * decides nothing: the sequencer owns the order of routs (the second player's
 * unit first, §7.5.6) and opens them one at a time, so at most one is ever
 * awaiting. The question is asked together with the walk: a side whose penalty is already known still holds its
 * rout, so a walk that answered with the first rout it found would answer about
 * the wrong player.
 *
 * @param state - The game state
 * @returns The rout awaiting its penalty and its parent, or `undefined`
 */
export function findRoutAwaitingPenalty(
  state: GameState,
): RoutLocation | undefined {
  const firstPlayer = state.currentInitiative;
  for (const player of [firstPlayer, getOtherPlayer(firstPlayer)]) {
    const location = findRoutLocation(state, player);
    if (
      location !== undefined &&
      isPending(location.routState.numberToDiscard)
    ) {
      return location;
    }
  }
  return undefined;
}
