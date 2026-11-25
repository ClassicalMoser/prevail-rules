import type { GameState } from '@game';
import { isResolved } from '@utils';
import { getOtherPlayer } from '@queries/player';
import type { RetreatLocation } from './findRetreatLocation';
import { findRetreatLocation } from './findRetreatLocation';

// TODO(composition): the second-player-first order of players is written
// out here, in findRetreatAwaitingChoice and in
// findRetreatAwaitingRout; getMeleeAppliesInResolutionOrder holds the same order
// by slot. Settled by one query for the players in the order their units suffer.
/**
 * The retreat whose path is settled and whose unit has not yet fallen back,
 * with the parent holding it.
 *
 * `resolveRetreat` moves the unit, and this is the retreat it is due for. The
 * path was the only legal one, taken as it opened, or the one its owner chose
 * among the smallest (§9.1.3).
 *
 * The question is asked together with the walk: a melee unit that has already
 * fallen back still holds its finished retreat, so a walk that answered with
 * the first retreat it found would answer about the wrong unit.
 *
 * @param state - The game state
 * @returns The retreat awaiting its move and its parent, or `undefined`
 */
export function findRetreatAwaitingMove(
  state: GameState,
): RetreatLocation | undefined {
  // In a melee the first player's attack takes effect first, so the second player's
  // unit suffers first (§7.5.6); elsewhere only one unit is retreating, and
  // the order asks after it all the same.
  const firstPlayer = state.currentInitiative;
  for (const player of [getOtherPlayer(firstPlayer), firstPlayer]) {
    const location = findRetreatLocation(state, player);
    // The way back is settled and the unit has not yet taken it.
    if (
      location !== undefined &&
      isResolved(location.retreatState.chosenRetreatPath) &&
      !location.retreatState.completed
    ) {
      // The first unit in that order still to fall back.
      return location;
    }
  }
  // No unit has a settled retreat left to carry out.
  return undefined;
}
