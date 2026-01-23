import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { updateCompletedPhase, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

describe('updateCompletedPhase', () => {
  it('should add phase to completed phases set', () => {
    const state = createEmptyGameState();
    const phaseState = {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    } as const;

    const newState = updateCompletedPhase(state, phaseState);

    expect(newState.currentRoundState.completedPhases.has(phaseState)).toBe(
      true,
    );
    expect(state.currentRoundState.completedPhases.has(phaseState)).toBe(false);
  });

  it('should not mutate the original state', () => {
    const state = createEmptyGameState();
    const originalCompletedPhases = state.currentRoundState.completedPhases;
    const phaseState = {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    } as const;

    updateCompletedPhase(state, phaseState);

    expect(state.currentRoundState.completedPhases).toBe(originalCompletedPhases);
  });

  it('should preserve existing completed phases', () => {
    const state = createEmptyGameState();
    const firstPhase = {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    } as const;
    const stateWithFirst = updateCompletedPhase(state, firstPhase);

    const secondPhase = {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    } as const;
    const stateWithBoth = updateCompletedPhase(stateWithFirst, secondPhase);

    expect(stateWithBoth.currentRoundState.completedPhases.has(firstPhase)).toBe(
      true,
    );
    expect(stateWithBoth.currentRoundState.completedPhases.has(secondPhase)).toBe(
      true,
    );
  });
});
