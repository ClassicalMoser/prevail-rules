import type { EngagementState, FlankEngagementResolutionState } from '@game';
import {
  createOpenedEngagementState,
  createOpenedFlankEngagementResolutionState,
} from '@factories';

/**
 * Creates a flank EngagementState with sensible defaults.
 */
export function createFlankEngagementState(
  overrides?: Partial<FlankEngagementResolutionState>,
): EngagementState & {
  engagementResolutionState: FlankEngagementResolutionState;
} {
  const resolution: FlankEngagementResolutionState = {
    ...createOpenedFlankEngagementResolutionState(),
    ...overrides,
  };
  const engagement = createOpenedEngagementState(resolution);
  const flank = { ...engagement, engagementResolutionState: resolution };
  return flank;
}
