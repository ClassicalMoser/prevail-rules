import type { UnitInstance } from '@entities';
import type { RearEngagementResolutionState } from '@game';
import { createOpenedRoutState } from './createOpenedRoutState';

/**
 * A rear engagement the moment it starts (§6.3.3): the defender routs
 * outright, and its owner owes the Morale, which `resolveRout` works out.
 *
 * @param defendingUnit - The unit engaged from the rear
 * @returns The rear engagement's resolution, with the defender's rout open
 */
export function createOpenedRearEngagementResolutionState(
  defendingUnit: UnitInstance,
): RearEngagementResolutionState {
  const resolution: RearEngagementResolutionState = {
    completed: false,
    engagementType: 'rear',
    routState: createOpenedRoutState(defendingUnit.playerSide, [defendingUnit]),
  };
  return resolution;
}
