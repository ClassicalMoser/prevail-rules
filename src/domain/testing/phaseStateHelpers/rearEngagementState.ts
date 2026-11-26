import type { EngagementState, RearEngagementResolutionState } from '@game';
import { createTestUnit } from '@testing/unitHelpers';
import {
  createOpenedEngagementState,
  createOpenedRearEngagementResolutionState,
} from '@factories';

/**
 * Creates a rear EngagementState with sensible defaults: white's unit is
 * engaged from the rear, and its rout is open.
 */
export function createRearEngagementState(
  overrides?: Partial<RearEngagementResolutionState>,
): EngagementState & {
  engagementResolutionState: RearEngagementResolutionState;
} {
  const resolution: RearEngagementResolutionState = {
    ...createOpenedRearEngagementResolutionState(createTestUnit('white')),
    ...overrides,
  };
  const engagement = createOpenedEngagementState(resolution);
  return { ...engagement, engagementResolutionState: resolution };
}
