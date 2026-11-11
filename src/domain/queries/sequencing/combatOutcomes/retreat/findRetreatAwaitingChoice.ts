import type { GameState } from '@game';
import { getOtherPlayer } from '@queries/player';
import type { RetreatLocation } from './findRetreatLocation';
import { findRetreatLocation } from './findRetreatLocation';

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
  // In a melee the first player's blow lands first, so the second player's
  // unit suffers first (§7.5.6); elsewhere only one unit is retreating, and
  // the order asks after it all the same.
  const firstPlayer = state.currentInitiative;
  for (const player of [getOtherPlayer(firstPlayer), firstPlayer]) {
    const location = findRetreatLocation(state, player);
    if (
      location !== undefined &&
      !location.retreatState.completed &&
      location.retreatState.chosenRetreatPath === 'pending' &&
      location.retreatState.legalRetreatPaths.length > 0
    ) {
      return location;
    }
  }
  return undefined;
}
