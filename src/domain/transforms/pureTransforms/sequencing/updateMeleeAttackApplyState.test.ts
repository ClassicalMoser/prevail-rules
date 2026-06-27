import {
  createAttackApplyState,
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '../';
import { throwIfNone, throwIfPending } from '@utils';

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

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('resolveMelee');
    if (phase.phase !== 'resolveMelee') {
      throw new Error('phase');
    }
    const melee = throwIfPending(phase.currentMeleeResolutionState, 'melee');
    const whiteApply = throwIfPending(
      melee.whiteAttackApplyState,
      'white apply',
    );
    const blackApply = throwIfPending(
      melee.blackAttackApplyState,
      'black apply',
    );
    expect(whiteApply.completed).toBeTruthy();
    expect(blackApply.completed).toBeFalsy();
  });

  it('given update black attack apply state', () => {
    const state = createStateInResolveMelee();
    const blackUnit = createTestUnit('black', { attack: 2 });
    const updated = createAttackApplyState(blackUnit, { completed: true });

    const newState = updateMeleeAttackApplyState(state, 'black', updated);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('resolveMelee');
    if (phase.phase !== 'resolveMelee') {
      throw new Error('phase');
    }
    const melee = throwIfPending(phase.currentMeleeResolutionState, 'melee');
    const blackApply = throwIfPending(
      melee.blackAttackApplyState,
      'black apply',
    );
    const whiteApply = throwIfPending(
      melee.whiteAttackApplyState,
      'white apply',
    );
    expect(blackApply.completed).toBeTruthy();
    expect(whiteApply.completed).toBeFalsy();
  });

  it('given not mutate the original state', () => {
    const state = createStateInResolveMelee();
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const origPhase = throwIfNone(
      state.currentRoundState.currentPhaseState,
      'phase',
    );
    const originalCompleted =
      origPhase.phase === 'resolveMelee'
        ? throwIfPending(
            throwIfPending(origPhase.currentMeleeResolutionState, 'melee')
              .whiteAttackApplyState,
            'white apply',
          ).completed
        : undefined;

    updateMeleeAttackApplyState(
      state,
      'white',
      createAttackApplyState(whiteUnit, { completed: true }),
    );

    const checkPhase = throwIfNone(
      state.currentRoundState.currentPhaseState,
      'phase',
    );
    const currentCompleted =
      checkPhase.phase === 'resolveMelee'
        ? throwIfPending(
            throwIfPending(checkPhase.currentMeleeResolutionState, 'melee')
              .whiteAttackApplyState,
            'white apply',
          ).completed
        : undefined;
    expect(currentCompleted).toBe(originalCompleted);
  });
});
