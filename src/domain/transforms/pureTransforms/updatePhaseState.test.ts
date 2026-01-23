import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { updatePhaseState } from './updatePhaseState';

describe('updatePhaseState', () => {
  it('should update the phase state', () => {
    const state = createEmptyGameState();
    const newPhaseState = {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    } as const;

    const newState = updatePhaseState(state, newPhaseState);

    expect(newState.currentRoundState.currentPhaseState).toEqual(newPhaseState);
  });

  it('should not mutate the original state', () => {
    const state = createEmptyGameState();
    const originalPhaseState = state.currentRoundState.currentPhaseState;
    const newPhaseState = {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'moveFirstCommander',
    } as const;

    updatePhaseState(state, newPhaseState);

    expect(state.currentRoundState.currentPhaseState).toBe(originalPhaseState);
  });

  it('should update to different phase and step', () => {
    const state = createEmptyGameState();
    const newPhaseState = {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    } as const;

    const newState = updatePhaseState(state, newPhaseState);

    expect(newState.currentRoundState.currentPhaseState?.phase).toBe(
      MOVE_COMMANDERS_PHASE,
    );
    expect(newState.currentRoundState.currentPhaseState?.step).toBe('complete');
  });
});
