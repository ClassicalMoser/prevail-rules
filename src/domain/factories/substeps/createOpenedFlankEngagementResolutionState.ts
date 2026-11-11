import type { FlankEngagementResolutionState } from '@game';

/**
 * A flank engagement the moment it starts (§6.3.4): the defender is still to
 * be turned to face the engaging unit.
 *
 * @returns The flank engagement's resolution, with the defender not yet turned
 */
export function createOpenedFlankEngagementResolutionState(): FlankEngagementResolutionState {
  const resolution: FlankEngagementResolutionState = {
    defenderRotated: false,
    engagementType: 'flank',
  };
  return resolution;
}
