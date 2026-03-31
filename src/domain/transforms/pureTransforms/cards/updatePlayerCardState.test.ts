import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { updatePlayerCardState } from './updatePlayerCardState';

/**
 * updatePlayerCardState: Creates a new game state with a player's card state updated.
 */
describe('updatePlayerCardState', () => {
  it('given update player card state with object', () => {
    const state = createEmptyGameState();

    const newState = updatePlayerCardState(state, 'black', {
      ...state.cardState.black,
      inHand: [tempCommandCards[0]],
    });

    expect(newState.cardState.black.inHand).toEqual([tempCommandCards[0]]);
    expect(newState.cardState.white).toBe(state.cardState.white);
  });

  it('given update player card state with function', () => {
    const state = createEmptyGameState();

    const newState = updatePlayerCardState(state, 'white', (current) => ({
      ...current,
      inHand: [tempCommandCards[1]],
    }));

    expect(newState.cardState.white.inHand).toEqual([tempCommandCards[1]]);
    expect(newState.cardState.black).toBe(state.cardState.black);
  });

  it('given not mutate the original state', () => {
    const state = createEmptyGameState();
    const originalBlackCardState = state.cardState.black;

    updatePlayerCardState(state, 'black', (current) => ({
      ...current,
      inHand: [tempCommandCards[0]],
    }));

    expect(state.cardState.black).toBe(originalBlackCardState);
    expect(state.cardState.black.inHand).not.toContain(tempCommandCards[0]);
  });

  it('given update correct player', () => {
    const state = createEmptyGameState();

    const newState = updatePlayerCardState(state, 'white', (current) => ({
      ...current,
      inHand: [tempCommandCards[1]],
    }));

    expect(newState.cardState.white.inHand).toEqual([tempCommandCards[1]]);
    expect(newState.cardState.black.inHand).not.toContain(tempCommandCards[1]);
  });
});
