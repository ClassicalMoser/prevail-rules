import type { GameState } from '@game';
import { isPending } from '@utils';
import { getOtherPlayer } from '@queries/player';
import type { RetreatLocation } from './findRetreatLocation';
import { findRetreatLocation } from './findRetreatLocation';

// TODO(composition): the second-player-first order of players is written
// out here, in findRetreatAwaitingMove and in
// findRetreatAwaitingRout; getMeleeAppliesInResolutionOrder holds the same order
// by slot. Settled by one query for the players in the order their units suffer.
/**
 * The retreat whose owner has more than a single way back to choose among,
 * with the parent holding it.
 *
 * Where several equally small retreats tie, the unit's owner chooses among
 * them by where they end (§9.1.3), and `chooseRetreatOption` is what they
 * send. This is the retreat that choice is due for: opened, not yet chosen,
 * with at least one legal path to offer.
 *
 * The question is asked together with the walk: a melee unit that has already
 * settled its retreat still holds it, so a walk that answered with the first
 * retreat it found would answer about the wrong unit.
 *
 * @param state - The game state
 * @returns The retreat awaiting its owner's choice and its parent, or `undefined`
 */
export function findRetreatAwaitingChoice(
  state: GameState,
): RetreatLocation | undefined {
  // In a melee the first player's attack takes effect first, so the second player's
  // unit suffers first (§7.5.6); elsewhere only one unit is retreating, and
  // the order asks after it all the same.
  const firstPlayer = state.currentInitiative;
  for (const player of [getOtherPlayer(firstPlayer), firstPlayer]) {
    const location = findRetreatLocation(state, player);
    // Still falling back, no way back chosen yet, and somewhere to go: a unit
    // with no legal retreat routs instead (§9.1.6) and has nothing to choose.
    // A single legal path is taken as the retreat opens, so it never waits here.
    if (
      location !== undefined &&
      !location.retreatState.completed &&
      isPending(location.retreatState.chosenRetreatPath) &&
      location.retreatState.legalRetreatPaths.length > 0
    ) {
      // The first unit in that order whose owner still has to choose.
      return location;
    }
  }
  // Nobody is choosing a way back.
  return undefined;
}
