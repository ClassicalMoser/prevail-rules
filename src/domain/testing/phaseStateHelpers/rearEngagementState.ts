import type { RearEngagementResolutionState, RearEngagementState } from '@game';
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
): RearEngagementState {
  // A defender caught from behind routs at once, with no fight (§6.3.3), so
  // its rout opens with the engagement.
  const resolution: RearEngagementResolutionState = {
    ...createOpenedRearEngagementResolutionState(createTestUnit('white')),
    ...overrides,
  };

  // The engagement holding that resolution.
  const engagement = createOpenedEngagementState(resolution);
  const rear = { ...engagement, engagementResolutionState: resolution };

  // The engagement, for a move's engagement slot.
  return rear;
}
