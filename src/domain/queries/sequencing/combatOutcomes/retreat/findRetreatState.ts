import type { GameState, RetreatState } from '@game';
import { findRetreatLocation } from './findRetreatLocation';

/**
 * The retreat this player is making, or `undefined` when they are not
 * retreating.
 *
 * This is {@link findRetreatLocation} for a caller that needs the retreat and not
 * the parent holding it, which is most of them: only finishing a retreat has
 * to know whether it closes a front engagement.
 *
 * Not retreating is an ordinary state, so this answers rather than throwing.
 * Callers that know a retreat must be there use `getRetreatState`.
 *
 * @param state - The game state
 * @param player - The player whose retreat to find
 * @returns That player's retreat, or `undefined` when they have none
 */
export function findRetreatState(
  state: GameState,
  player: 'white' | 'black',
): RetreatState | undefined {
  const location = findRetreatLocation(state, player);
  // This player's unit is not falling back.
  if (location === undefined) {
    return undefined;
  }
  // The retreat, whichever parent holds it.
  const retreatState = location.retreatState;
  return retreatState;
}
