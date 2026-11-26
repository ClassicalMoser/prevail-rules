import type { UnitInstance } from '@entities';
import type { EngagementState, FrontEngagementResolutionState } from '@game';
import { createUnitWithPlacement } from '@testing/testHelpers';
import {
  createOpenedEngagementState,
  createOpenedFrontEngagementResolutionState,
} from '@factories';

const defaultEngagingUnit = (): UnitInstance =>
  createUnitWithPlacement({ playerSide: 'black' }).unit;

/**
 * Creates a front EngagementState with sensible defaults.
 */
export function createFrontEngagementState(
  overrides?: Partial<FrontEngagementResolutionState>,
): EngagementState & {
  engagementResolutionState: FrontEngagementResolutionState;
} {
  // The engaging unit's Speed, by default its printed Speed: no round
  // effect or committed card counted unless the spec says otherwise.
  const resolution: FrontEngagementResolutionState = {
    ...createOpenedFrontEngagementResolutionState(
      defaultEngagingUnit().unitType.stats.speed,
    ),
    ...overrides,
  };
  const engagement = createOpenedEngagementState(resolution);
  return { ...engagement, engagementResolutionState: resolution };
}
