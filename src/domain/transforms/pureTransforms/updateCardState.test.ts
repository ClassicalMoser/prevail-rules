import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { updateCardState } from './updateCardState';

describe('updateCardState', () => {
  it('should update card state with object', () => {
    const state = createEmptyGameState();
    const newCardState = {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inHand: [commandCards[0]],
      },
    };

    const newState = updateCardState(state, newCardState);

    expect(newState.cardState.black.inHand).toEqual([commandCards[0]]);
    expect(newState.cardState.white).toBe(state.cardState.white);
  });

  it('should update card state with function', () => {
    const state = createEmptyGameState();

    const newState = updateCardState(state, (current) => ({
      ...current,
      black: {
        ...current.black,
        inHand: [commandCards[0]],
      },
    }));

    expect(newState.cardState.black.inHand).toEqual([commandCards[0]]);
  });

  it('should not mutate the original state', () => {
    const state = createEmptyGameState();
    const originalCardState = state.cardState;

    updateCardState(state, (current) => ({
      ...current,
      black: { ...current.black, inHand: [commandCards[0]] },
    }));

    expect(state.cardState).toBe(originalCardState);
    expect(state.cardState.black.inHand).not.toContain(commandCards[0]);
  });
});
