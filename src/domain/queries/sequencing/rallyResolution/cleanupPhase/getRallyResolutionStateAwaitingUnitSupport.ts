import type { GameState, RallyResolutionState } from '@game';
import { getRallyResolutionStateForCurrentStep } from './getRallyResolutionStateForCurrentStep';
import { isAwaitingUnitSupport } from './isAwaitingUnitSupport';

/**
 * Rally resolution state for the current resolve-rally step after the rally burn effect has been
 * applied, but before support assignment has populated `unitsLostSupport`.
 *
 * Panicky narrowing for `applyAssignUnitSupportEvent` /
 * `applyUnitsLostSupportAfterRally`.
 *
 * @param state - The current game state
 * @param player - The rallying player (must match the cleanup step)
 * @throws Error if wrong step/player, rally not resolved yet, or support already assigned
 */
export function getRallyResolutionStateAwaitingUnitSupport(
  state: GameState,
  player: 'white' | 'black',
): RallyResolutionState {
  // The rally of the player whose resolve step this is.
  const rallyState = getRallyResolutionStateForCurrentStep(state, player);

  // Support is assigned only after the burn, and only while the list is still pending.
  if (!isAwaitingUnitSupport(rallyState)) {
    throw new Error(
      rallyState.rallyResolved
        ? 'Units lost support already resolved'
        : 'Rally has not been resolved yet',
    );
  }

  // The rally, with every card back in hand and the support check to make.
  return rallyState;
}
