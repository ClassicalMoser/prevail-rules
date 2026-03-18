import type {
  EngagementState,
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  RearEngagementResolutionState,
  StandardBoard,
  UnitInstance,
  UnitPlacement,
} from '@entities';
import { createUnitWithPlacement } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';
import { createRoutState } from './substepStates';

const defaultEngagingUnit = (): UnitInstance =>
  createUnitWithPlacement({ playerSide: 'black' }).unit;

const defaultTargetPlacement: UnitPlacement<StandardBoard> = {
  coordinate: 'E-5',
  facing: 'north',
};

/**
 * Creates a front EngagementState with sensible defaults.
 */
export function createFrontEngagementState(
  overrides?: Partial<FrontEngagementResolutionState>,
): EngagementState<StandardBoard> & {
  engagementResolutionState: FrontEngagementResolutionState;
} {
  return {
    substepType: 'engagementResolution',
    engagingUnit: defaultEngagingUnit(),
    targetPlacement: defaultTargetPlacement,
    engagementResolutionState: {
      engagementType: 'front',
      defensiveCommitment: { commitmentType: 'pending' },
      defendingUnitCanRetreat: undefined,
      defendingUnitRetreats: undefined,
      defendingUnitRetreated: undefined,
      ...overrides,
    },
    completed: false,
  };
}

/**
 * Creates a flank EngagementState with sensible defaults.
 */
export function createFlankEngagementState(
  overrides?: Partial<FlankEngagementResolutionState>,
): EngagementState<StandardBoard> & {
  engagementResolutionState: FlankEngagementResolutionState;
} {
  return {
    substepType: 'engagementResolution',
    engagingUnit: defaultEngagingUnit(),
    targetPlacement: defaultTargetPlacement,
    engagementResolutionState: {
      engagementType: 'flank',
      defenderRotated: false,
      ...overrides,
    },
    completed: false,
  };
}

/**
 * Creates a rear EngagementState with sensible defaults.
 */
export function createRearEngagementState(
  overrides?: Partial<RearEngagementResolutionState>,
): EngagementState<StandardBoard> & {
  engagementResolutionState: RearEngagementResolutionState;
} {
  return {
    substepType: 'engagementResolution',
    engagingUnit: defaultEngagingUnit(),
    targetPlacement: defaultTargetPlacement,
    engagementResolutionState: {
      engagementType: 'rear',
      routState: createRoutState('white', createTestUnit('white')),
      completed: false,
      ...overrides,
    },
    completed: false,
  };
}
