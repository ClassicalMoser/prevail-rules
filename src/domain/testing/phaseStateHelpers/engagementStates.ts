import type { UnitInstance, UnitPlacement } from '@entities';
import type {
  EngagementState,
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  RearEngagementResolutionState,
} from '@game';
import { createUnitWithPlacement } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';
import { createRoutState } from './substepStates';

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
  return {
    completed: false,
    engagementResolutionState: {
      defendingUnitCanRetreat: 'pending',
      defendingUnitRetreated: 'pending',
      defendingUnitRetreats: 'pending',
      defensiveCommitment: { commitmentType: 'pending' },
      engagementType: 'front',
      ...overrides,
    },
    engagingUnit: defaultEngagingUnit(),
    substepType: 'engagementResolution',
    targetPlacement: defaultTargetPlacement,
  };
}

/**
 * Creates a flank EngagementState with sensible defaults.
 */
export function createFlankEngagementState(
  overrides?: Partial<FlankEngagementResolutionState>,
): EngagementState & {
  engagementResolutionState: FlankEngagementResolutionState;
} {
  return {
    completed: false,
    engagementResolutionState: {
      defenderRotated: false,
      engagementType: 'flank',
      ...overrides,
    },
    engagingUnit: defaultEngagingUnit(),
    substepType: 'engagementResolution',
    targetPlacement: defaultTargetPlacement,
  };
}

/**
 * Creates a rear EngagementState with sensible defaults.
 */
export function createRearEngagementState(
  overrides?: Partial<RearEngagementResolutionState>,
): EngagementState & {
  engagementResolutionState: RearEngagementResolutionState;
} {
  return {
    completed: false,
    engagementResolutionState: {
      completed: false,
      engagementType: 'rear',
      routState: createRoutState('white', createTestUnit('white')),
      ...overrides,
    },
    engagingUnit: defaultEngagingUnit(),
    substepType: 'engagementResolution',
    targetPlacement: defaultTargetPlacement,
  };
}
