import type { GameState } from '@game';
import { isPending } from '@utils';
import { getOtherPlayer } from '@queries/player';
import type { RetreatLocation } from './findRetreatLocation';
import { findRetreatLocation } from './findRetreatLocation';

// TODO(composition): the second-player-first order of players is written
// out here, in findRetreatAwaitingChoice and in
// findRetreatAwaitingMove; getMeleeAppliesInResolutionOrder holds the same order
// by slot. Settled by one query for the players in the order their units suffer.
// TODO(composition): finds its slot by "no legal retreat path" rather than
// by a record of which retreat is awaiting its rout. Settled by deciding
// whether that condition is a fair way to name the slot.
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
    // Nowhere to fall back to, and the rout that takes the retreat's place
    // (§9.1.6) is not yet written.
    if (
      location !== undefined &&
      location.retreatState.legalRetreatPaths.length === 0 &&
      isPending(location.retreatState.routState)
    ) {
      // The first unit in that order whose retreat must become a rout.
      return location;
    }
  }
  // No retreat is waiting to turn into a rout.
  return undefined;
}
