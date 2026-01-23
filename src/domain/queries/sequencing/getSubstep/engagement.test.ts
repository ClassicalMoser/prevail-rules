import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createTestUnit,
} from '@testing';
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
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            substepType: 'engagementResolution' as const,
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
            engagementResolutionState: {
              engagementType: 'front' as const,
              defensiveCommitment: { commitmentType: 'pending' as const },
              defendingUnitCanRetreat: undefined,
              defendingUnitRetreats: undefined,
              defendingUnitRetreated: undefined,
            },
            completed: false,
          },
        }),
      },
    );

    const result = getEngagementStateFromMovement(state);
    expect(result.substepType).toBe('engagementResolution');
    expect(result.engagingUnit).toEqual(engagingUnit);
  });

  it('should throw error when engagement state is missing', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: undefined,
        }),
      },
    );

    expect(() => getEngagementStateFromMovement(state)).toThrow(
      'No engagement state found in movement resolution',
    );
  });

  it('should throw error when not in movement resolution', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(state),
      },
    );

    expect(() => getEngagementStateFromMovement(state)).toThrow(
      'Current command resolution is not a movement',
    );
  });
});

describe('getFlankEngagementStateFromMovement', () => {
  it('should return flank engagement state', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            substepType: 'engagementResolution' as const,
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
            engagementResolutionState: {
              engagementType: 'flank' as const,
              defenderRotated: false,
            },
            completed: false,
          },
        }),
      },
    );

    const result = getFlankEngagementStateFromMovement(state);
    expect(result.engagementResolutionState.engagementType).toBe('flank');
    expect(result.engagementResolutionState.defenderRotated).toBe(false);
  });

  it('should throw error when engagement type is not flank', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            substepType: 'engagementResolution' as const,
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
            engagementResolutionState: {
              engagementType: 'front' as const,
              defensiveCommitment: { commitmentType: 'pending' as const },
              defendingUnitCanRetreat: undefined,
              defendingUnitRetreats: undefined,
              defendingUnitRetreated: undefined,
            },
            completed: false,
          },
        }),
      },
    );

    expect(() => getFlankEngagementStateFromMovement(state)).toThrow(
      'Engagement type is not flank',
    );
  });
});

describe('getFrontEngagementStateFromMovement', () => {
  it('should return front engagement state', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            substepType: 'engagementResolution' as const,
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
            engagementResolutionState: {
              engagementType: 'front' as const,
              defensiveCommitment: { commitmentType: 'pending' as const },
              defendingUnitCanRetreat: undefined,
              defendingUnitRetreats: undefined,
              defendingUnitRetreated: undefined,
            },
            completed: false,
          },
        }),
      },
    );

    const result = getFrontEngagementStateFromMovement(state);
    expect(result.engagementResolutionState.engagementType).toBe('front');
    expect(
      result.engagementResolutionState.defensiveCommitment.commitmentType,
    ).toBe('pending');
  });

  it('should throw error when engagement type is not front', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            substepType: 'engagementResolution' as const,
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
            engagementResolutionState: {
              engagementType: 'flank' as const,
              defenderRotated: false,
            },
            completed: false,
          },
        }),
      },
    );

    expect(() => getFrontEngagementStateFromMovement(state)).toThrow(
      'Engagement type is not front',
    );
  });
});

describe('getRearEngagementStateFromMovement', () => {
  it('should return rear engagement state', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            substepType: 'engagementResolution' as const,
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
            engagementResolutionState: {
              engagementType: 'rear' as const,
              routState: {
                substepType: 'rout' as const,
                player: 'white' as const,
                unitsToRout: new Set([defendingUnit]),
                numberToDiscard: defendingUnit.unitType.routPenalty,
                cardsChosen: false,
                completed: false,
              },
              completed: false,
            },
            completed: false,
          },
        }),
      },
    );

    const result = getRearEngagementStateFromMovement(state);
    expect(result.engagementResolutionState.engagementType).toBe('rear');
    expect(result.engagementResolutionState.routState).toBeDefined();
  });

  it('should throw error when engagement type is not rear', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: engagingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          engagementState: {
            substepType: 'engagementResolution' as const,
            engagingUnit,
            targetPlacement: { coordinate: 'E-6', facing: 'north' },
            engagementResolutionState: {
              engagementType: 'front' as const,
              defensiveCommitment: { commitmentType: 'pending' as const },
              defendingUnitCanRetreat: undefined,
              defendingUnitRetreats: undefined,
              defendingUnitRetreated: undefined,
            },
            completed: false,
          },
        }),
      },
    );

    expect(() => getRearEngagementStateFromMovement(state)).toThrow(
      'Engagement type is not rear',
    );
  });
});
