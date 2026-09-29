import {
  createAttackApplyState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';

import {
  getMeleeResolutionReadyForAttackCalculation,
  getMeleeResolutionState,
} from './getMeleeResolutionState';

import { createEmptyGameState } from '@factories';
/**
 * Melee-resolution accessors: the current melee slice, and the slice ready for attack calculation.
 */
describe(getMeleeResolutionState, () => {
  it('given default resolveMelee factory, returns melee slice with both commitments completed', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState =
      createResolveMeleePhaseState(state);

    const result = getMeleeResolutionState(state);
    expect(result.whiteCommitment.commitmentType).toBe('completed');
    expect(result.blackCommitment.commitmentType).toBe('completed');
  });

  it('given issueCommands phase, throws not in resolveMelee phase', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state),
      },
    );

    expect(() => getMeleeResolutionState(state)).toThrow(
      'Not in resolveMelee phase',
    );
  });

  it('given missing phase slice, throws not in resolveMelee phase', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = 'none';

    expect(() => getMeleeResolutionState(state)).toThrow(
      'Not in resolveMelee phase',
    );
  });

  it('given resolveMelee with undefined currentMeleeResolutionState, throws no current melee resolution', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: 'pending' as const,
      },
    );

    expect(() => getMeleeResolutionState(state)).toThrow(
      'No current melee resolution state',
    );
  });
});

describe(getMeleeResolutionReadyForAttackCalculation, () => {
  it('given default resolveMelee with completed commitments and no apply, returns melee at E-5', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState =
      createResolveMeleePhaseState(state);

    const result = getMeleeResolutionReadyForAttackCalculation(state);
    expect(result.location).toBe('E-5');
  });

  it('given white commitment pending, throws white commitment is still pending', () => {
    const state = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(state, {
      whiteCommitment: { commitmentType: 'pending' },
    });
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: melee,
      },
    );

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'White commitment is still pending',
    );
  });

  it('given black commitment pending, throws black commitment is still pending', () => {
    const state = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(state, {
      blackCommitment: { commitmentType: 'pending' },
    });
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: melee,
      },
    );

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Black commitment is still pending',
    );
  });

  it('given white attackApplyState already set, throws attack apply states already exist', () => {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white', { attack: 2 });
    const melee = createMeleeResolutionState(state, {
      whiteAttackApplyState: createAttackApplyState(unit),
    });
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: melee,
      },
    );

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Attack apply states already exist',
    );
  });

  it('given black attackApplyState already set, throws attack apply states already exist', () => {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('black', { attack: 2 });
    const melee = createMeleeResolutionState(state, {
      blackAttackApplyState: createAttackApplyState(unit),
    });
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: melee,
      },
    );

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Attack apply states already exist',
    );
  });
});
