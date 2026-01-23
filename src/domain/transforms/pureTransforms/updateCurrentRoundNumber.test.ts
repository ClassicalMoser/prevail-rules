import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { updateCurrentRoundNumber } from './updateCurrentRoundNumber';

describe('updateCurrentRoundNumber', () => {
  it('should update the current round number', () => {
    const state = createEmptyGameState();
    const newRoundNumber = 5;

    const newState = updateCurrentRoundNumber(state, newRoundNumber);

    expect(newState.currentRoundNumber).toBe(newRoundNumber);
    expect(newState).not.toBe(state);
  });

  it('should preserve all other state properties', () => {
    const state = createEmptyGameState();
    const newRoundNumber = 3;

    const newState = updateCurrentRoundNumber(state, newRoundNumber);

    expect(newState.currentRoundState).toBe(state.currentRoundState);
    expect(newState.currentInitiative).toBe(state.currentInitiative);
    expect(newState.boardState).toBe(state.boardState);
    expect(newState.cardState).toBe(state.cardState);
  });
});
