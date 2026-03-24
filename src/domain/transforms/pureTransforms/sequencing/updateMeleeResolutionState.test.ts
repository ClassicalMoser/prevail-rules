import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { updateMeleeResolutionState } from './updateMeleeResolutionState';

/**
 * updateMeleeResolutionState: Creates a new game state with the melee resolution state updated in the resolve melee phase.
 */
describe('updateMeleeResolutionState', () => {
  it('given update the melee resolution state in resolve melee phase', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const meleeState = createMeleeResolutionState(state);
    const phaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: meleeState,
    });
    const stateInPhase = updatePhaseState(state, phaseState);

    const updatedMelee = createMeleeResolutionState(state, { completed: true });
    const newState = updateMeleeResolutionState(stateInPhase, updatedMelee);

    expect(newState.currentRoundState.currentPhaseState?.phase).toBe(
      'resolveMelee',
    );
    const newPhaseState = newState.currentRoundState.currentPhaseState;
    if (newPhaseState?.phase !== 'resolveMelee') throw new Error('phase');
    expect(newPhaseState.currentMeleeResolutionState?.completed).toBe(true);
  });

  it('given not mutate the original state', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const meleeState = createMeleeResolutionState(state);
    const phaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: meleeState,
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const originalMelee =
      stateInPhase.currentRoundState.currentPhaseState?.phase === 'resolveMelee'
        ? stateInPhase.currentRoundState.currentPhaseState
            .currentMeleeResolutionState
        : undefined;

    updateMeleeResolutionState(stateInPhase, {
      ...meleeState,
      completed: true,
    });

    expect(
      stateInPhase.currentRoundState.currentPhaseState?.phase ===
        'resolveMelee' &&
        stateInPhase.currentRoundState.currentPhaseState
          .currentMeleeResolutionState,
    ).toBe(originalMelee);
  });

  it('given when no current melee resolution state is set, throws', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const phaseState = createResolveMeleePhaseState(state, {
      currentMeleeResolutionState: undefined,
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const meleeState = createMeleeResolutionState(state);

    expect(() => updateMeleeResolutionState(stateInPhase, meleeState)).toThrow(
      'No current melee resolution state found',
    );
  });
});
