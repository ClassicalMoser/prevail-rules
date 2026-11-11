import type { UnitInstance } from '@entities';
import type { ReverseState } from '@game';

/**
 * A reverse the moment it opens: the unit is to be turned about (§9.2), and
 * where it ends up is not yet worked out. The reverse holds the unit by
 * identity; its position is read from the board when it resolves.
 *
 * @param reversingUnit - The unit being turned about
 * @returns The reverse substep, open and unfinished
 */
export function createOpenedReverseState(
  reversingUnit: UnitInstance,
): ReverseState {
  const reverseState: ReverseState = {
    completed: false,
    finalPosition: 'pending',
    reversingUnit,
    substepType: 'reverse',
  };
  return reverseState;
}
