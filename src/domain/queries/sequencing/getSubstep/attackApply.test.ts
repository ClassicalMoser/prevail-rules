import {
  createAttackApplyState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
} from './attackApply';

describe('getAttackApplyStateFromRangedAttack', () => {
  it('should return attack apply state from ranged attack resolution', () => {
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

    const result = getAttackApplyStateFromRangedAttack(state);
    expect(result.completed).toBe(false);
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

    expect(() => getAttackApplyStateFromRangedAttack(state)).toThrow(
      'No attack apply state found in ranged attack resolution',
    );
  });

  it('should throw error when not in ranged attack resolution', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state),
      },
    );

    expect(() => getAttackApplyStateFromRangedAttack(state)).toThrow(
      'Current command resolution is not a ranged attack',
    );
  });
});

describe('getAttackApplyStateFromMelee', () => {
  it('should return white attack apply state when player is white', () => {
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
          whiteAttackApplyState: createAttackApplyState(whiteUnit),
          blackAttackApplyState: createAttackApplyState(
            createTestUnit('black', { attack: 2 }),
          ),
          completed: false,
        },
      },
    );

    const result = getAttackApplyStateFromMelee(state, 'white');
    expect(result.completed).toBe(false);
  });

  it('should return black attack apply state when player is black', () => {
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
          blackAttackApplyState: createAttackApplyState(
            createTestUnit('black', { attack: 2 }),
            {
              attackResult: {
                unitRouted: true,
                unitRetreated: false,
                unitReversed: false,
              },
            },
          ),
          completed: false,
        },
      },
    );

    const result = getAttackApplyStateFromMelee(state, 'black');
    expect(result.attackResult.unitRouted).toBe(true);
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

    expect(() => getAttackApplyStateFromMelee(state, 'white')).toThrow(
      'No white attack apply state found in melee resolution',
    );
  });
});
