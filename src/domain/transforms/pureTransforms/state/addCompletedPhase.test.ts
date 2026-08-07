import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from '@game';
import { createEmptyGameState } from '@testing';
import { addCompletedPhase } from '../';

/**
 * AddCompletedPhase: Adds a completed phase to the completed phases set.
 */
describe(addCompletedPhase, () => {
  it('adds the phase to completedPhases without mutating the input', () => {
    const state = createEmptyGameState();
    const phaseState = {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    } as const;

    const newState = addCompletedPhase(state, phaseState);

    expect(newState.currentRoundState.completedPhases).toContain(phaseState);
    expect(state.currentRoundState.completedPhases).not.toContain(phaseState);
  });

  it('leaves the original completedPhases reference unchanged', () => {
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

  it('keeps existing completed phases when adding another', () => {
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

    expect(stateWithBoth.currentRoundState.completedPhases).toContain(
      firstPhase,
    );
    expect(stateWithBoth.currentRoundState.completedPhases).toContain(
      secondPhase,
    );
  });
});
