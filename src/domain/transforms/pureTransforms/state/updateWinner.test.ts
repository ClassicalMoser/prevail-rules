import { createEmptyGameState } from '@testing';

import { updateWinner } from './updateWinner';

/**
 * UpdateWinner: assigns GameState.winner (PlayerSide or null draw).
 */
describe(updateWinner, () => {
  it('sets the winner', () => {
    const state = createEmptyGameState();
    const newState = updateWinner(state, 'black');
    expect(newState.winner).toBe('black');
    expect(newState).not.toBe(state);
  });

  it('allows a null winner for draws', () => {
    const state = createEmptyGameState();
    expect(updateWinner(state, null).winner).toBeNull();
  });

  it('preserves other top-level fields', () => {
    const state = createEmptyGameState();
    const newState = updateWinner(state, 'white');
    expect(newState.currentRoundState).toBe(state.currentRoundState);
    expect(newState.boardState).toBe(state.boardState);
    expect(newState.cardState).toBe(state.cardState);
  });
});
