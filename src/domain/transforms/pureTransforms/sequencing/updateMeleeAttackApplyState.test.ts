import {
  createAttackApplyState,
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { updateMeleeAttackApplyState } from './updateMeleeAttackApplyState';

/**
 * updateMeleeAttackApplyState: Creates a new game state with the attack apply state updated for a specific player in melee resolution.
 */
describe('updateMeleeAttackApplyState', () => {
  function createStateInResolveMelee() {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const meleeState = createMeleeResolutionState(state, {
      whiteAttackApplyState: createAttackApplyState(whiteUnit),
      blackAttackApplyState: createAttackApplyState(blackUnit),
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
    if (phase?.phase !== 'resolveMelee') throw new Error('phase');
    expect(
      phase.currentMeleeResolutionState?.whiteAttackApplyState?.completed,
    ).toBe(true);
    expect(
      phase.currentMeleeResolutionState?.blackAttackApplyState?.completed,
    ).toBe(false);
  });

  it('given update black attack apply state', () => {
    const state = createStateInResolveMelee();
    const blackUnit = createTestUnit('black', { attack: 2 });
    const updated = createAttackApplyState(blackUnit, { completed: true });

    const newState = updateMeleeAttackApplyState(state, 'black', updated);

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('resolveMelee');
    if (phase?.phase !== 'resolveMelee') throw new Error('phase');
    expect(
      phase.currentMeleeResolutionState?.blackAttackApplyState?.completed,
    ).toBe(true);
    expect(
      phase.currentMeleeResolutionState?.whiteAttackApplyState?.completed,
    ).toBe(false);
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
