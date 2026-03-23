import {
  createEmptyGameState,
  createFlankEngagementState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import {
  getEngagementStateFromMovement,
  getFlankEngagementStateFromMovement,
  getFrontEngagementStateFromMovement,
  getRearEngagementStateFromMovement,
} from './engagement';

describe('getEngagementStateFromMovement', () => {
  it('should return engagement state from movement resolution', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            ...createFrontEngagementState(),
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
          },
        }),
      }),
    );

    const result = getEngagementStateFromMovement(stateInPhase);
    expect(result.substepType).toBe('engagementResolution');
    expect(result.engagingUnit).toEqual(engagingUnit);
  });

  it('should throw error when engagement state is missing', () => {
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: undefined,
        }),
      }),
    );

    expect(() => getEngagementStateFromMovement(stateInPhase)).toThrow(
      'No engagement state found in movement resolution',
    );
  });

  it('should throw error when not in movement resolution', () => {
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createRangedAttackResolutionState(state),
      }),
    );

    expect(() => getEngagementStateFromMovement(stateInPhase)).toThrow(
      'Current command resolution is not a movement',
    );
  });
});

describe('getFlankEngagementStateFromMovement', () => {
  it('should return flank engagement state', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            ...createFlankEngagementState(),
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
          },
        }),
      }),
    );

    const result = getFlankEngagementStateFromMovement(stateInPhase);
    expect(result.engagementResolutionState.engagementType).toBe('flank');
    expect(result.engagementResolutionState.defenderRotated).toBe(false);
  });

  it('should throw error when engagement type is not flank', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            ...createFrontEngagementState(),
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
          },
        }),
      }),
    );

    expect(() => getFlankEngagementStateFromMovement(stateInPhase)).toThrow(
      'Engagement type is not flank',
    );
  });
});

describe('getFrontEngagementStateFromMovement', () => {
  it('should return front engagement state', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            ...createFrontEngagementState(),
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
          },
        }),
      }),
    );

    const result = getFrontEngagementStateFromMovement(stateInPhase);
    expect(result.engagementResolutionState.engagementType).toBe('front');
    expect(
      result.engagementResolutionState.defensiveCommitment.commitmentType,
    ).toBe('pending');
  });

  it('should throw error when engagement type is not front', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            ...createFlankEngagementState(),
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
          },
        }),
      }),
    );

    expect(() => getFrontEngagementStateFromMovement(stateInPhase)).toThrow(
      'Engagement type is not front',
    );
  });
});

describe('getRearEngagementStateFromMovement', () => {
  it('should return rear engagement state', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            ...createRearEngagementState({
              routState: createRoutState('white', defendingUnit, {
                numberToDiscard: defendingUnit.unitType.routPenalty,
              }),
            }),
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
          },
        }),
      }),
    );

    const result = getRearEngagementStateFromMovement(stateInPhase);
    expect(result.engagementResolutionState.engagementType).toBe('rear');
    expect(result.engagementResolutionState.routState).toEqual(
      expect.objectContaining({
        substepType: 'rout',
        player: 'white',
      }),
    );
  });

  it('should throw error when engagement type is not rear', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            ...createFrontEngagementState(),
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
          },
        }),
      }),
    );

    expect(() => getRearEngagementStateFromMovement(stateInPhase)).toThrow(
      'Engagement type is not rear',
    );
  });
});
