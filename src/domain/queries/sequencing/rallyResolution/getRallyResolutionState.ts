import type { PlayerSide } from '@entities';
import type { GameState, RallyResolutionState } from '@game';
import { findRallyResolutionState } from './findRallyResolutionState';

/**
 * One player's rally this cleanup, where the caller knows it has begun.
 *
 * @param state - The game state, in cleanup
 * @param player - The player whose rally to read
 * @returns The rally resolution state for the player
 * @throws Error if not in cleanup phase or that player's rally has not begun
 */
export function getRallyResolutionState(
  state: GameState,
  player: PlayerSide,
): RallyResolutionState {
  const rallyState = findRallyResolutionState(state, player);
  if (rallyState === undefined) {
    throw new Error(`No ${player} rally resolution state found`);
  }
  return rallyState;
}
