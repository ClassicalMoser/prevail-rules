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
import { updatePhaseState } from '@transforms';

import {
  getEngagementStateFromMovement,
  getFlankEngagementStateFromMovement,
  getFrontEngagementStateFromMovement,
  getRearEngagementStateFromMovement,
} from './engagement';

/**
 * Movement engagement slice: raw `engagementState` plus typed narrowers for flank / front / rear
 * resolution substates on the movement CRS.
 */
describe(getEngagementStateFromMovement, () => {
  it('given movement with front engagement seeded, returns engagementResolution wrapper and engager', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: {
            ...createFrontEngagementState(),
            engagingUnit,
            targetPlacement: {
              boardType: 'standard' as const,
              coordinate: 'E-6',
              facing: 'north',
            },
          },
          movingUnit: {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5',
              facing: 'north',
            },
            unit: engagingUnit,
          },
        }),
      }),
    );

    const result = getEngagementStateFromMovement(stateInPhase);
    expect(result.substepType).toBe('engagementResolution');
    expect(result.engagingUnit).toStrictEqual(engagingUnit);
  });

  it('given movement without engagementState, throws no engagement in movement', () => {
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: 'pending' as const,
        }),
      }),
    );

    expect(() => getEngagementStateFromMovement(stateInPhase)).toThrow(
      'No engagement state found in movement resolution',
    );
  });

  it('given ranged CRS, throws current command resolution is not movement', () => {
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

describe(getFlankEngagementStateFromMovement, () => {
  it('given movement with flank engagement, engagementType flank and defender not rotated', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: {
            ...createFlankEngagementState(),
            engagingUnit,
            targetPlacement: {
              boardType: 'standard' as const,
              coordinate: 'E-6',
              facing: 'north',
            },
          },
          movingUnit: {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5',
              facing: 'north',
            },
            unit: engagingUnit,
          },
        }),
      }),
    );

    const result = getFlankEngagementStateFromMovement(stateInPhase);
    expect(result.engagementResolutionState.engagementType).toBe('flank');
    expect(result.engagementResolutionState.defenderRotated).toBeFalsy();
  });

  it('given front engagement instead of flank, throws engagement type is not flank', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: {
            ...createFrontEngagementState(),
            engagingUnit,
            targetPlacement: {
              boardType: 'standard' as const,
              coordinate: 'E-6',
              facing: 'north',
            },
          },
          movingUnit: {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5',
              facing: 'north',
            },
            unit: engagingUnit,
          },
        }),
      }),
    );

    expect(() => getFlankEngagementStateFromMovement(stateInPhase)).toThrow(
      'Engagement type is not flank',
    );
  });
});

describe(getFrontEngagementStateFromMovement, () => {
  it('given movement with front engagement, defensive commitment pending', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: {
            ...createFrontEngagementState(),
            engagingUnit,
            targetPlacement: {
              boardType: 'standard' as const,
              coordinate: 'E-6',
              facing: 'north',
            },
          },
          movingUnit: {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5',
              facing: 'north',
            },
            unit: engagingUnit,
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

  it('given error when engagement type is not front, throws', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: {
            ...createFlankEngagementState(),
            engagingUnit,
            targetPlacement: {
              boardType: 'standard' as const,
              coordinate: 'E-6',
              facing: 'north',
            },
          },
          movingUnit: {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5',
              facing: 'north',
            },
            unit: engagingUnit,
          },
        }),
      }),
    );

    expect(() => getFrontEngagementStateFromMovement(stateInPhase)).toThrow(
      'Engagement type is not front',
    );
  });
});

describe(getRearEngagementStateFromMovement, () => {
  it('given rear engagement with routState, returns rear slice containing rout', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: {
            ...createRearEngagementState({
              routState: createRoutState('white', defendingUnit, {
                numberToDiscard: defendingUnit.unitType.routPenalty,
              }),
            }),
            engagingUnit,
            targetPlacement: {
              boardType: 'standard' as const,
              coordinate: 'E-6',
              facing: 'north',
            },
          },
          movingUnit: {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5',
              facing: 'north',
            },
            unit: engagingUnit,
          },
        }),
      }),
    );

    const result = getRearEngagementStateFromMovement(stateInPhase);
    expect(result.engagementResolutionState.engagementType).toBe('rear');
    expect(result.engagementResolutionState.routState).toStrictEqual(
      expect.objectContaining({
        player: 'white',
        substepType: 'rout',
      }),
    );
  });

  it('given front engagement instead of rear, throws engagement type is not rear', () => {
    const engagingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: {
            ...createFrontEngagementState(),
            engagingUnit,
            targetPlacement: {
              boardType: 'standard' as const,
              coordinate: 'E-6',
              facing: 'north',
            },
          },
          movingUnit: {
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5',
              facing: 'north',
            },
            unit: engagingUnit,
          },
        }),
      }),
    );

    expect(() => getRearEngagementStateFromMovement(stateInPhase)).toThrow(
      'Engagement type is not rear',
    );
  });
});
