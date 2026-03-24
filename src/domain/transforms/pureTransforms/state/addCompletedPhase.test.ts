import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { addCompletedPhase } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

/**
 * addCompletedPhase: Adds a completed phase to the completed phases set.
 */
describe('addCompletedPhase', () => {
  it('given add phase to completed phases set', () => {
    const state = createEmptyGameState();
    const phaseState = {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    } as const;

    const newState = addCompletedPhase(state, phaseState);

    expect(newState.currentRoundState.completedPhases.has(phaseState)).toBe(
      true,
    );
    expect(state.currentRoundState.completedPhases.has(phaseState)).toBe(false);
  });

  it('given not mutate the original state', () => {
    const state = createEmptyGameState();
    const originalCompletedPhases = state.currentRoundState.completedPhases;
    const phaseState = {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    } as const;

    addCompletedPhase(state, phaseState);

    expect(state.currentRoundState.completedPhases).toBe(
      originalCompletedPhases,
    );
  });

  it('given preserve existing completed phases', () => {
    const state = createEmptyGameState();
    const firstPhase = {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    } as const;
    const stateWithFirst = addCompletedPhase(state, firstPhase);

    const secondPhase = {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    } as const;
    const stateWithBoth = addCompletedPhase(stateWithFirst, secondPhase);

    expect(
      stateWithBoth.currentRoundState.completedPhases.has(firstPhase),
    ).toBe(true);
    expect(
      stateWithBoth.currentRoundState.completedPhases.has(secondPhase),
    ).toBe(true);
  });
});
