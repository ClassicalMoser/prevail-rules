import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import {
  findRetreatState,
  getRetreatStateFromAttackApply,
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
} from './retreat';

describe('getRetreatStateFromAttackApply', () => {
  it('should return retreat state from attack apply state', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState = createAttackApplyStateWithRetreat({
      unit,
      placement: { coordinate: 'E-5', facing: 'north' },
    });

    const result = getRetreatStateFromAttackApply(attackApplyState);
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toEqual(unit);
  });

  it('should throw error when retreat state is missing', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState = createAttackApplyState(unit);

    expect(() => getRetreatStateFromAttackApply(attackApplyState)).toThrow(
      'No retreat state found in attack apply state',
    );
  });
});

describe('getRetreatStateFromRangedAttack', () => {
  it('should return retreat state from ranged attack resolution', () => {
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
            attackApplyState: createAttackApplyStateWithRetreat({
              unit: defendingUnit,
              placement: { coordinate: 'E-5', facing: 'north' },
            }),
          },
        ),
      },
    );

    const result = getRetreatStateFromRangedAttack(state);
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toEqual(defendingUnit);
  });

  it('should throw error when attack apply state is missing', () => {
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
            attackApplyState: undefined,
          },
        ),
      },
    );

    expect(() => getRetreatStateFromRangedAttack(state)).toThrow(
      'No attack apply state found in ranged attack resolution',
    );
  });

  it('should throw error when retreat state is missing from attack apply', () => {
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
            attackApplyState: createAttackApplyState(defendingUnit),
          },
        ),
      },
    );

    expect(() => getRetreatStateFromRangedAttack(state)).toThrow(
      'No retreat state found in attack apply state',
    );
  });
});

describe('getRetreatStateFromMelee', () => {
  it('should return retreat state from melee resolution for white player', () => {
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          substepType: 'meleeResolution' as const,
          location: 'E-5',
          whiteCommitment: {
            commitmentType: 'completed',
            card: state.cardState.white.inPlay!,
          },
          blackCommitment: {
            commitmentType: 'completed',
            card: state.cardState.black.inPlay!,
          },
          whiteAttackApplyState: createAttackApplyStateWithRetreat({
            unit: whiteUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          }),
          blackAttackApplyState: createAttackApplyState(
            createTestUnit('black', { attack: 2 }),
          ),
          completed: false,
        },
      },
    );

    const result = getRetreatStateFromMelee(state, 'white');
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toEqual(whiteUnit);
  });

  it('should return retreat state from melee resolution for black player', () => {
    const blackUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          substepType: 'meleeResolution' as const,
          location: 'E-5',
          whiteCommitment: {
            commitmentType: 'completed',
            card: state.cardState.white.inPlay!,
          },
          blackCommitment: {
            commitmentType: 'completed',
            card: state.cardState.black.inPlay!,
          },
          whiteAttackApplyState: createAttackApplyState(
            createTestUnit('white', { attack: 2 }),
          ),
          blackAttackApplyState: createAttackApplyStateWithRetreat({
            unit: blackUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          }),
          completed: false,
        },
      },
    );

    const result = getRetreatStateFromMelee(state, 'black');
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toEqual(blackUnit);
  });

  it('should throw error when attack apply state is missing', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          substepType: 'meleeResolution' as const,
          location: 'E-5',
          whiteCommitment: {
            commitmentType: 'completed',
            card: state.cardState.white.inPlay!,
          },
          blackCommitment: {
            commitmentType: 'completed',
            card: state.cardState.black.inPlay!,
          },
          whiteAttackApplyState: undefined,
          blackAttackApplyState: createAttackApplyState(
            createTestUnit('black', { attack: 2 }),
          ),
          completed: false,
        },
      },
    );

    expect(() => getRetreatStateFromMelee(state, 'white')).toThrow(
      'No white attack apply state found in melee resolution',
    );
  });
});

describe('findRetreatState', () => {
  it('should find retreat state from ranged attack resolution', () => {
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            defendingUnit,
            attackApplyState: createAttackApplyStateWithRetreat({
              unit: defendingUnit,
              placement: { coordinate: 'E-5', facing: 'north' },
            }),
          },
        ),
      },
    );

    const result = findRetreatState(state, 'white');
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toEqual(defendingUnit);
  });

  it('should find retreat state from melee resolution', () => {
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          substepType: 'meleeResolution' as const,
          location: 'E-5',
          whiteCommitment: {
            commitmentType: 'completed',
            card: state.cardState.white.inPlay!,
          },
          blackCommitment: {
            commitmentType: 'completed',
            card: state.cardState.black.inPlay!,
          },
          whiteAttackApplyState: createAttackApplyStateWithRetreat({
            unit: whiteUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          }),
          blackAttackApplyState: createAttackApplyState(
            createTestUnit('black', { attack: 2 }),
          ),
          completed: false,
        },
      },
    );

    const result = findRetreatState(state, 'white');
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toEqual(whiteUnit);
  });

  it('should throw error when retreat state not found', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state),
      },
    );

    expect(() => findRetreatState(state, 'white')).toThrow(
      'No retreat state found for player white',
    );
  });

  it('should throw error when player does not match retreating unit', () => {
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            defendingUnit,
            attackApplyState: createAttackApplyStateWithRetreat({
              unit: defendingUnit,
              placement: { coordinate: 'E-5', facing: 'north' },
            }),
          },
        ),
      },
    );

    expect(() => findRetreatState(state, 'black')).toThrow(
      'No retreat state found for player black',
    );
  });
});
