import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { updateRoundState } from './updateRoundState';

describe('updateRoundState', () => {
  it('should update the round state', () => {
    const state = createEmptyGameState();
    const newRoundState = {
      ...state.currentRoundState,
      roundNumber: 2,
    };

    const newState = updateRoundState(state, newRoundState);

    expect(newState.currentRoundState.roundNumber).toBe(2);
  });

  it('should not mutate the original state', () => {
    const state = createEmptyGameState();
    const originalRoundNumber = state.currentRoundState.roundNumber;
    const newRoundState = {
      ...state.currentRoundState,
      roundNumber: 2,
    };

    updateRoundState(state, newRoundState);

    expect(state.currentRoundState.roundNumber).toBe(originalRoundNumber);
  });

  it('should update round state using a function', () => {
    const state = createEmptyGameState();
    const newState = updateRoundState(state, (current) => ({
      ...current,
      roundNumber: current.roundNumber + 1,
    }));

    expect(newState.currentRoundState.roundNumber).toBe(2);
    expect(state.currentRoundState.roundNumber).toBe(1);
  });
});
