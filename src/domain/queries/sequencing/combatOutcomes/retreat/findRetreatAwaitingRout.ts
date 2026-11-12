import type { GameState } from '@game';
import { isPending } from '@utils';
import { getOtherPlayer } from '@queries/player';
import type { RetreatLocation } from './findRetreatLocation';
import { findRetreatLocation } from './findRetreatLocation';

/**
 * The retreat with nowhere to go whose rout has not opened yet, with the
 * parent holding it.
 *
 * A unit that cannot retreat routs instead (§9.1.6), and
 * `triggerRoutFromRetreat` opens that rout on the retreat. This is the retreat
 * it is due for.
 *
 * The question is asked together with the walk: in a melee where both units
 * were hit to retreat, the other unit's retreat may be open beside this one,
 * so a walk that answered with the first retreat it found could name the
 * wrong player.
 *
 * @param state - The game state
 * @returns The retreat awaiting its rout and its parent, or `undefined`
 */
export function findRetreatAwaitingRout(
  state: GameState,
): RetreatLocation | undefined {
  // In a melee the first player's attack takes effect first, so the second player's
  // unit suffers first (§7.5.6); elsewhere only one unit is retreating, and
  // the order asks after it all the same.
  const firstPlayer = state.currentInitiative;
  for (const player of [getOtherPlayer(firstPlayer), firstPlayer]) {
    const location = findRetreatLocation(state, player);
    if (
      location !== undefined &&
      location.retreatState.legalRetreatPaths.length === 0 &&
      isPending(location.retreatState.routState)
    ) {
      return location;
    }
  }
  return undefined;
}
