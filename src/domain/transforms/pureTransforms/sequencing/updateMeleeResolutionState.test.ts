import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { throwIfNone, throwIfPending } from '@utils';

import { updateMeleeResolutionState } from './updateMeleeResolutionState';

/**
 * UpdateMeleeResolutionState: Creates a new game state with the melee resolution state updated in the resolve melee phase.
 */
describe(updateMeleeResolutionState, () => {
  it('given update the melee resolution state in resolve melee phase', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const meleeState = createMeleeResolutionState(state);
    const phaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: meleeState,
    });
    const stateInPhase = updatePhaseState(state, phaseState);

    const updatedMelee = createMeleeResolutionState(state, { completed: true });
    const newState = updateMeleeResolutionState(stateInPhase, updatedMelee);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('resolveMelee');
    if (phase.phase !== 'resolveMelee') {
      throw new Error('phase');
    }
    const melee = throwIfPending(phase.currentMeleeResolutionState, 'melee');
    expect(melee.completed).toBeTruthy();
  });

  it('given not mutate the original state', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const meleeState = createMeleeResolutionState(state);
    const phaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: meleeState,
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const origPhase = throwIfNone(
      stateInPhase.currentRoundState.currentPhaseState,
      'phase',
    );
    const originalMelee =
      origPhase.phase === 'resolveMelee'
        ? throwIfPending(origPhase.currentMeleeResolutionState, 'melee')
        : undefined;

    updateMeleeResolutionState(stateInPhase, {
      ...meleeState,
      completed: true,
    });

    const checkPhase = throwIfNone(
      stateInPhase.currentRoundState.currentPhaseState,
      'phase',
    );
    const currentMelee =
      checkPhase.phase === 'resolveMelee'
        ? throwIfPending(checkPhase.currentMeleeResolutionState, 'melee')
        : undefined;
    expect(currentMelee).toBe(originalMelee);
  });

  it('given when no current melee resolution state is set, throws', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const phaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: 'pending',
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const meleeState = createMeleeResolutionState(state);

    expect(() => updateMeleeResolutionState(stateInPhase, meleeState)).toThrow(
      'No current melee resolution state found',
    );
  });
});
