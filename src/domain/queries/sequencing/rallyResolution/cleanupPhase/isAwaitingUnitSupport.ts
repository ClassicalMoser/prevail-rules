import type { RallyResolutionState } from '@game';
import { isPending } from '@utils';

/**
 * Whether a rally is at the point where its player assigns unit support: the
 * burn has been applied, and the units that lost support are not yet settled.
 * Support is assigned only after the burn (§10.3), and only once.
 *
 * This is the question; `getRallyResolutionStateAwaitingUnitSupport` is the
 * getter that insists on it, and the legal-option list asks it to answer `null`
 * outside this moment.
 *
 * @param rallyState - The rally being resolved
 * @returns True when support is due and not yet assigned
 */
export function isAwaitingUnitSupport(
  rallyState: RallyResolutionState,
): boolean {
  // The cards are back in hand, so the check can be made, and it has not
  // been made yet.
  const awaiting =
    rallyState.rallyResolved && isPending(rallyState.unitsLostSupport);

  // Whether this is the moment to assign support.
  return awaiting;
}
