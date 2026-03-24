import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { updateBoardState } from './updateBoardState';

/**
 * updateBoardState: Creates a new game state with the board state updated.
 */
describe('updateBoardState', () => {
  it('given update the board state', () => {
    const state = createEmptyGameState();
    const newBoard = state.boardState; // Same board for simplicity

    const newState = updateBoardState(state, newBoard);

    expect(newState.boardState).toBe(newBoard);
  });

  it('given not mutate the original state', () => {
    const state = createEmptyGameState();
    const originalBoardState = state.boardState;
    const newBoard = state.boardState;

    updateBoardState(state, newBoard);

    expect(state.boardState).toBe(originalBoardState);
  });
});
