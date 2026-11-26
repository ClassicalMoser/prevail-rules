import type {
  FlankEngagementResolutionState,
  FlankEngagementState,
} from '@game';
import {
  createOpenedEngagementState,
  createOpenedFlankEngagementResolutionState,
} from '@factories';

/**
 * Creates a flank EngagementState with sensible defaults.
 */
export function createFlankEngagementState(
  overrides?: Partial<FlankEngagementResolutionState>,
): FlankEngagementState {
  // A defender struck in the flank turns to face its attacker and may not
  // fall back (§6.3.4); as it opens, it has not yet turned.
  const resolution: FlankEngagementResolutionState = {
    ...createOpenedFlankEngagementResolutionState(),
    ...overrides,
  };

  // The engagement holding that resolution.
  const engagement = createOpenedEngagementState(resolution);
  const flank = { ...engagement, engagementResolutionState: resolution };

  // The engagement, for a move's engagement slot.
  return flank;
}
