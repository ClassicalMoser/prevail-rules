import {
  createAttackApplyState,
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { updateMeleeAttackApplyState } from './updateMeleeAttackApplyState';

/**
 * UpdateMeleeAttackApplyState: Creates a new game state with the attack apply state updated for a specific player in melee resolution.
 */
describe(updateMeleeAttackApplyState, () => {
  function createStateInResolveMelee() {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const meleeState = createMeleeResolutionState(state, {
      blackAttackApplyState: createAttackApplyState(blackUnit),
      whiteAttackApplyState: createAttackApplyState(whiteUnit),
    });
    const phaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: meleeState,
    });
    return updatePhaseState(state, phaseState);
  }

  it('given update white attack apply state', () => {
    const state = createStateInResolveMelee();
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const updated = createAttackApplyState(whiteUnit, { completed: true });

    const newState = updateMeleeAttackApplyState(state, 'white', updated);

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('resolveMelee');
    if (phase?.phase !== 'resolveMelee') {
      throw new Error('phase');
    }
    expect(
      phase.currentMeleeResolutionState?.whiteAttackApplyState?.completed,
    ).toBeTruthy();
    expect(
      phase.currentMeleeResolutionState?.blackAttackApplyState?.completed,
    ).toBeFalsy();
  });

  it('given update black attack apply state', () => {
    const state = createStateInResolveMelee();
    const blackUnit = createTestUnit('black', { attack: 2 });
    const updated = createAttackApplyState(blackUnit, { completed: true });

    const newState = updateMeleeAttackApplyState(state, 'black', updated);

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('resolveMelee');
    if (phase?.phase !== 'resolveMelee') {
      throw new Error('phase');
    }
    expect(
      phase.currentMeleeResolutionState?.blackAttackApplyState?.completed,
    ).toBeTruthy();
    expect(
      phase.currentMeleeResolutionState?.whiteAttackApplyState?.completed,
    ).toBeFalsy();
  });

  it('given not mutate the original state', () => {
    const state = createStateInResolveMelee();
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const originalCompleted =
      state.currentRoundState.currentPhaseState?.phase === 'resolveMelee'
        ? state.currentRoundState.currentPhaseState.currentMeleeResolutionState
            ?.whiteAttackApplyState?.completed
        : undefined;

    updateMeleeAttackApplyState(
      state,
      'white',
      createAttackApplyState(whiteUnit, { completed: true }),
    );

    expect(
      state.currentRoundState.currentPhaseState?.phase === 'resolveMelee' &&
        state.currentRoundState.currentPhaseState.currentMeleeResolutionState
          ?.whiteAttackApplyState?.completed,
    ).toBe(originalCompleted);
  });
});
