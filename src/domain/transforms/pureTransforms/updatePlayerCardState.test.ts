import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { updatePlayerCardState } from './updatePlayerCardState';

describe('updatePlayerCardState', () => {
  it('should update player card state with object', () => {
    const state = createEmptyGameState();

    const newState = updatePlayerCardState(state, 'black', {
      ...state.cardState.black,
      inHand: [commandCards[0]],
    });

    expect(newState.cardState.black.inHand).toEqual([commandCards[0]]);
    expect(newState.cardState.white).toBe(state.cardState.white);
  });

  it('should update player card state with function', () => {
    const state = createEmptyGameState();

    const newState = updatePlayerCardState(state, 'white', (current) => ({
      ...current,
      inHand: [commandCards[1]],
    }));

    expect(newState.cardState.white.inHand).toEqual([commandCards[1]]);
    expect(newState.cardState.black).toBe(state.cardState.black);
  });

  it('should not mutate the original state', () => {
    const state = createEmptyGameState();
    const originalBlackCardState = state.cardState.black;

    updatePlayerCardState(state, 'black', (current) => ({
      ...current,
      inHand: [commandCards[0]],
    }));

    expect(state.cardState.black).toBe(originalBlackCardState);
    expect(state.cardState.black.inHand).not.toContain(commandCards[0]);
  });

  it('should update correct player', () => {
    const state = createEmptyGameState();

    const newState = updatePlayerCardState(state, 'white', (current) => ({
      ...current,
      inHand: [commandCards[1]],
    }));

    expect(newState.cardState.white.inHand).toEqual([commandCards[1]]);
    expect(newState.cardState.black.inHand).not.toContain(commandCards[1]);
  });
});
