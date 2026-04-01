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

/**
 * Attack-apply getters: ranged CRS slice, per-player melee apply, and which defender still owes
 * an incomplete melee apply given initiative order.
 */
describe('getAttackApplyStateFromRangedAttack', () => {
  it('given ranged CRS with nested apply, returns that attackApplyState', () => {
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

  it('given ranged CRS without apply, throws no attack apply in ranged', () => {
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

  it('given movement CRS, throws current command resolution is not ranged attack', () => {
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
  it('given melee with white apply, getAttackApplyFromMelee(white) returns white slice', () => {
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          substepType: 'meleeResolution' as const,
          boardType: 'standard' as const,
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

  it('given melee with black apply showing rout result, black getter returns that apply', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          substepType: 'meleeResolution' as const,
          boardType: 'standard' as const,
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

  it('given melee missing white apply, getAttackApplyFromMelee(white) throws', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          substepType: 'meleeResolution' as const,
          boardType: 'standard' as const,
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
  it('given black initiative and black apply incomplete, next defender is black', () => {
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

  it('given black initiative with black complete and white incomplete, next defender is white', () => {
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

  it('given both applies completed, returns null', () => {
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

  it('given missing white apply, returns null', () => {
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
