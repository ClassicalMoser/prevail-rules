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
import { updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getDefendingPlayerForNextIncompleteMeleeAttackApply,
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

describe('getDefendingPlayerForNextIncompleteMeleeAttackApply', () => {
  it('returns initiative player when their attack apply is still incomplete', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const meleeState = createMeleeResolutionState(state, {
      whiteAttackApplyState: createAttackApplyState(whiteUnit, {
        completed: true,
      }),
      blackAttackApplyState: createAttackApplyState(blackUnit, {
        completed: false,
      }),
    });
    const phaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: meleeState,
    });
    const gameState = updatePhaseState(state, phaseState);

    expect(
      getDefendingPlayerForNextIncompleteMeleeAttackApply(
        gameState,
        meleeState,
      ),
    ).toBe('black');
  });

  it('returns second player when initiative player apply is already complete', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const meleeState = createMeleeResolutionState(state, {
      whiteAttackApplyState: createAttackApplyState(whiteUnit, {
        completed: false,
      }),
      blackAttackApplyState: createAttackApplyState(blackUnit, {
        completed: true,
      }),
    });
    const phaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: meleeState,
    });
    const gameState = updatePhaseState(state, phaseState);

    expect(
      getDefendingPlayerForNextIncompleteMeleeAttackApply(
        gameState,
        meleeState,
      ),
    ).toBe('white');
  });

  it('returns null when both attack apply states are complete', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const meleeState = createMeleeResolutionState(state, {
      whiteAttackApplyState: createAttackApplyState(whiteUnit, {
        completed: true,
      }),
      blackAttackApplyState: createAttackApplyState(blackUnit, {
        completed: true,
      }),
    });

    expect(
      getDefendingPlayerForNextIncompleteMeleeAttackApply(state, meleeState),
    ).toBeNull();
  });

  it('returns null when either attack apply state is missing', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const meleeState = createMeleeResolutionState(state, {
      whiteAttackApplyState: undefined,
      blackAttackApplyState: createAttackApplyState(blackUnit),
    });

    expect(
      getDefendingPlayerForNextIncompleteMeleeAttackApply(state, meleeState),
    ).toBeNull();
  });
});
