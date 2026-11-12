import type { GameState } from '@game';
import { getOtherPlayer } from '@queries/player';
import type { RetreatLocation } from './findRetreatLocation';
import { findRetreatLocation } from './findRetreatLocation';

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
    if (
      location !== undefined &&
      location.retreatState.chosenRetreatPath !== 'pending' &&
      !location.retreatState.completed
    ) {
      return location;
    }
  }
  return undefined;
}
