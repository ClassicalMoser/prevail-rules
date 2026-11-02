import type { RallyResolutionState, RoutState } from '@game';
import { throwIfPending } from '@utils';

/**
 * Gets the rout state from a rally resolution state.
 * Assumes the rally resolution state has a rout state (validation should happen elsewhere).
 *
 * @param rallyState - The rally resolution state
 * @returns The rout state
 * @throws Error if rout state is missing
 */
export function getRoutStateFromRally(
  rallyState: RallyResolutionState,
): RoutState {
  return throwIfPending(
    rallyState.routState,
    'No rout state found in rally resolution state',
  );
}
