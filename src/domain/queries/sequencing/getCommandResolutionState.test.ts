import {
  createAttackApplyState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import {
  getCurrentCommandResolutionState,
  getMeleeResolutionReadyForAttackCalculation,
  getMeleeResolutionState,
  getMovementResolutionState,
  getRangedAttackResolutionState,
} from './getCommandResolutionState';

describe('getCurrentCommandResolutionState', () => {
  it('should return command resolution state from issue commands phase', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state),
      },
    );

    const result = getCurrentCommandResolutionState(state);
    expect(result.commandResolutionType).toBe('movement');
  });

  it('should throw error when not in issueCommands phase', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createResolveMeleePhaseState(state);

    expect(() => getCurrentCommandResolutionState(state)).toThrow(
      'Not in issueCommands phase',
    );
  });

  it('should throw error when phase state is missing', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = undefined;

    expect(() => getCurrentCommandResolutionState(state)).toThrow(
      'Not in issueCommands phase',
    );
  });

  it('should throw error when command resolution state is missing', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state);

    expect(() => getCurrentCommandResolutionState(state)).toThrow(
      'No current command resolution state',
    );
  });
});

describe('getRangedAttackResolutionState', () => {
  it('should return ranged attack resolution state', () => {
    const attackingUnit = createTestUnit('black', { attack: 2 });
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            attackingUnit,
            defendingUnit,
          },
        ),
      },
    );

    const result = getRangedAttackResolutionState(state);
    expect(result.commandResolutionType).toBe('rangedAttack');
    expect(result.attackingUnit).toEqual(attackingUnit);
    expect(result.defendingUnit).toEqual(defendingUnit);
  });

  it('should throw error when command resolution is not ranged attack', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state),
      },
    );

    expect(() => getRangedAttackResolutionState(state)).toThrow(
      'Current command resolution is not a ranged attack',
    );
  });
});

describe('getMovementResolutionState', () => {
  it('should return movement resolution state', () => {
    const movingUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state, {
          movingUnit: {
            unit: movingUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
        }),
      },
    );

    const result = getMovementResolutionState(state);
    expect(result.commandResolutionType).toBe('movement');
    expect(result.movingUnit.unit).toEqual(movingUnit);
  });

  it('should throw error when command resolution is not movement', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(state),
      },
    );

    expect(() => getMovementResolutionState(state)).toThrow(
      'Current command resolution is not a movement',
    );
  });
});

describe('getMeleeResolutionState', () => {
  it('should return melee resolution state', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createResolveMeleePhaseState(state);

    const result = getMeleeResolutionState(state);
    expect(result.whiteCommitment.commitmentType).toBe('completed');
    expect(result.blackCommitment.commitmentType).toBe('completed');
  });

  it('should throw error when not in resolveMelee phase', () => {
    const state = createEmptyGameState();
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

  it('should throw error when phase state is missing', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = undefined;

    expect(() => getMeleeResolutionState(state)).toThrow(
      'Not in resolveMelee phase',
    );
  });

  it('should throw error when melee resolution state is missing', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: undefined,
      },
    );

    expect(() => getMeleeResolutionState(state)).toThrow(
      'No current melee resolution state',
    );
  });
});

describe('getMeleeResolutionReadyForAttackCalculation', () => {
  it('returns melee state when ready for attack calculation', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createResolveMeleePhaseState(state);

    const result = getMeleeResolutionReadyForAttackCalculation(state);
    expect(result.location).toBe('E-5');
  });

  it('throws when white commitment is pending', () => {
    const state = createEmptyGameState();
    const melee = createMeleeResolutionState(state, {
      whiteCommitment: { commitmentType: 'pending' },
    });
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      { currentMeleeResolutionState: melee },
    );

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'White commitment is still pending',
    );
  });

  it('throws when black commitment is pending', () => {
    const state = createEmptyGameState();
    const melee = createMeleeResolutionState(state, {
      blackCommitment: { commitmentType: 'pending' },
    });
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      { currentMeleeResolutionState: melee },
    );

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Black commitment is still pending',
    );
  });

  it('throws when attack apply state already exists (white only)', () => {
    const state = createEmptyGameState();
    const unit = createTestUnit('white', { attack: 2 });
    const melee = createMeleeResolutionState(state, {
      whiteAttackApplyState: createAttackApplyState(unit),
    });
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      { currentMeleeResolutionState: melee },
    );

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Attack apply states already exist',
    );
  });

  it('throws when attack apply state already exists (black only)', () => {
    const state = createEmptyGameState();
    const unit = createTestUnit('black', { attack: 2 });
    const melee = createMeleeResolutionState(state, {
      blackAttackApplyState: createAttackApplyState(unit),
    });
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      { currentMeleeResolutionState: melee },
    );

    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Attack apply states already exist',
    );
  });
});
