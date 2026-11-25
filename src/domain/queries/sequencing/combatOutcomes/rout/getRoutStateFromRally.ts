import type { RallyResolutionState, RoutState } from '@game';
import { throwIfPending } from '@utils';

/**
 * The rout a rally's support check costs, or `'bypassed'` when every unit
 * kept its support and nothing routs.
 *
 * `'bypassed'` is an answer: the check was made and routed nobody. `'pending'`
 * is not: the check has not been made, so asking for the rout then is a
 * sequencing fault rather than a fact about the game.
 *
 * @param rallyState - The rally resolution state
 * @returns The rout substep, or `'bypassed'` when nothing routs
 * @throws Error when the support check has not been made yet
 */
export function getRoutStateFromRally(
  rallyState: RallyResolutionState,
): RoutState | 'bypassed' {
  // The open rout, or `'bypassed'` when every unit kept its place.
  return throwIfPending(
    rallyState.routState,
    'No rout state found in rally resolution state',
  );
}
