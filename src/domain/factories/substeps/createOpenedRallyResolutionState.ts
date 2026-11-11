import type { RallyResolutionState } from '@game';

/**
 * A player's rally the moment they have chosen whether to rally (§10.3):
 * nothing is burnt, no support is assigned and nothing has routed yet.
 *
 * @param playerRallied - Whether the player chose to rally
 * @returns The rally resolution, begun and unresolved
 */
export function createOpenedRallyResolutionState(
  playerRallied: boolean,
): RallyResolutionState {
  const rallyState: RallyResolutionState = {
    completed: false,
    playerRallied,
    rallyResolved: false,
    routState: 'pending',
    unitsLostSupport: 'pending',
  };
  return rallyState;
}
