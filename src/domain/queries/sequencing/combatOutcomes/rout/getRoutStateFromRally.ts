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
// TODO(misleading): the README lists this as a parent reader that answers
// `'bypassed'`, but a rally's rout slot has no `'bypassed'`: `'pending'` there
// also means nobody lost support and nothing will rout. Settled by giving the
// rally slot `'bypassed'` (a `@game` decision), or by the README not listing it.
export function getRoutStateFromRally(
  rallyState: RallyResolutionState,
): RoutState {
  return throwIfPending(
    rallyState.routState,
    'No rout state found in rally resolution state',
  );
}
