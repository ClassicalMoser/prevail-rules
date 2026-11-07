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
 * parent comes back too, because applying that effect has to write the penalty
 * to the slot it came from.
 *
 * Both sides are asked after in initiative order, and the question is asked
 * together with the walk: a side whose penalty is already known still holds its
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
