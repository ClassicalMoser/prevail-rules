import type { StandardBoard, UnitInstance, UnitPlacement } from '@entities';
import type {
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  RearEngagementResolutionState,
  StandardEngagementState,
} from '@game';
import { createUnitWithPlacement } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';
import { createRoutState } from './substepStates';

const defaultEngagingUnit = (): UnitInstance =>
  createUnitWithPlacement({ playerSide: 'black' }).unit;

const defaultTargetPlacement: UnitPlacement<StandardBoard> = {
  boardType: 'standard' as const,
  coordinate: 'E-5',
  facing: 'north',
};

/**
 * Creates a front EngagementState with sensible defaults.
 */
export function createFrontEngagementState(
  overrides?: Partial<FrontEngagementResolutionState>,
): StandardEngagementState & {
  engagementResolutionState: FrontEngagementResolutionState;
} {
  return {
    substepType: 'engagementResolution',
    boardType: 'standard' as const,
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
): StandardEngagementState & {
  engagementResolutionState: FlankEngagementResolutionState;
} {
  return {
    substepType: 'engagementResolution',
    boardType: 'standard' as const,
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
): StandardEngagementState & {
  engagementResolutionState: RearEngagementResolutionState;
} {
  return {
    substepType: 'engagementResolution',
    boardType: 'standard' as const,
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
