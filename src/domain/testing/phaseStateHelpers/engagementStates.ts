import type { StandardBoard, UnitInstance, UnitPlacement } from '@entities';
import type {
  EngagementStateForBoard,
  FlankEngagementResolutionState,
  FrontEngagementResolutionState,
  RearEngagementResolutionState,
} from '@game';
import { createUnitWithPlacement } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';
import { createRoutState } from './substepStates';

const defaultEngagingUnit = (): UnitInstance =>
  createUnitWithPlacement({ playerSide: 'black' }).unit;

const defaultTargetPlacement: UnitPlacement<StandardBoard> = {
  boardType: 'standard' as const,
  coordinate: 'E-5' as const,
  facing: 'north',
};

/**
 * Creates a front EngagementState with sensible defaults.
 */
export function createFrontEngagementState(
  overrides?: Partial<FrontEngagementResolutionState>,
): EngagementStateForBoard<StandardBoard> & {
  engagementResolutionState: FrontEngagementResolutionState;
} {
  return {
    boardType: 'standard' as const,
    completed: false,
    engagementResolutionState: {
      defendingUnitCanRetreat: undefined,
      defendingUnitRetreated: undefined,
      defendingUnitRetreats: undefined,
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
): EngagementStateForBoard<StandardBoard> & {
  engagementResolutionState: FlankEngagementResolutionState;
} {
  return {
    boardType: 'standard' as const,
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
): EngagementStateForBoard<StandardBoard> & {
  engagementResolutionState: RearEngagementResolutionState;
} {
  return {
    boardType: 'standard' as const,
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
