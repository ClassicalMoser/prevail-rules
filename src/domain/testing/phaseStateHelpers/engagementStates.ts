import type { UnitInstance, UnitPlacement } from '@entities';
import type {
  EngagementState,
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  RearEngagementResolutionState,
} from '@game';
import { createUnitWithPlacement } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';
import {
  createOpenedEngagementState,
  createOpenedFlankEngagementResolutionState,
  createOpenedFrontEngagementResolutionState,
  createOpenedRearEngagementResolutionState,
} from '@factories';

const defaultEngagingUnit = (): UnitInstance =>
  createUnitWithPlacement({ playerSide: 'black' }).unit;

const defaultTargetPlacement: UnitPlacement = {
  coordinate: 'E-5' as const,
  facing: 'north',
};

/**
 * Creates a front EngagementState with sensible defaults.
 */
export function createFrontEngagementState(
  overrides?: Partial<FrontEngagementResolutionState>,
): EngagementState & {
  engagementResolutionState: FrontEngagementResolutionState;
} {
  const resolution: FrontEngagementResolutionState = {
    ...createOpenedFrontEngagementResolutionState(),
    ...overrides,
  };
  const engagement = createOpenedEngagementState(
    resolution,
    defaultEngagingUnit(),
    defaultTargetPlacement,
  );
  return { ...engagement, engagementResolutionState: resolution };
}

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
  const engagement = createOpenedEngagementState(
    resolution,
    defaultEngagingUnit(),
    defaultTargetPlacement,
  );
  return { ...engagement, engagementResolutionState: resolution };
}

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
  const engagement = createOpenedEngagementState(
    resolution,
    defaultEngagingUnit(),
    defaultTargetPlacement,
  );
  return { ...engagement, engagementResolutionState: resolution };
}
