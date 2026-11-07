import type { GameState, RetreatState } from '@game';
import { findRetreatState } from './findRetreatState';

/**
 * The retreat this player is making, for a caller that knows there is one.
 *
 * Choosing a destination and moving the unit are both sequenced after the
 * retreat was opened, so a missing one there is a sequencing fault rather than
 * a quiet state of the game. Use `findRetreatState` to ask whether the player
 * is retreating at all.
 *
 * @param state - The game state
 * @param player - The player whose retreat to read
 * @returns That player's retreat
 * @throws Error when that player is not retreating
 */
export function getRetreatState(
  state: GameState,
  player: 'white' | 'black',
): RetreatState {
  const retreatState = findRetreatState(state, player);
  if (retreatState === undefined) {
    throw new Error(`No retreat is in play for ${player}`);
  }
  return retreatState;
}
