import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { updatePlayerCardState } from './updatePlayerCardState';

/**
 * UpdatePlayerCardState: Creates a new game state with a player's card state updated.
 */
describe(updatePlayerCardState, () => {
  it('given update player card state', () => {
    const state = createEmptyGameState();

    const newState = updatePlayerCardState(state, 'black', {
      ...state.cardState.black,
      inHand: [tempCommandCards[0]],
    });

    expect(newState.cardState.black.inHand).toStrictEqual([
      tempCommandCards[0],
    ]);
    expect(newState.cardState.white).toBe(state.cardState.white);
  });

  it('given not mutate the original state', () => {
    const state = createEmptyGameState();
    const originalBlackCardState = state.cardState.black;

    updatePlayerCardState(state, 'black', {
      ...state.cardState.black,
      inHand: [tempCommandCards[0]],
    });

    expect(state.cardState.black).toBe(originalBlackCardState);
    expect(state.cardState.black.inHand).not.toContain(tempCommandCards[0]);
  });

  it('given update correct player', () => {
    const state = createEmptyGameState();

    const newState = updatePlayerCardState(state, 'white', {
      ...state.cardState.white,
      inHand: [tempCommandCards[1]],
    });

    expect(newState.cardState.white.inHand).toStrictEqual([
      tempCommandCards[1],
    ]);
    expect(newState.cardState.black.inHand).not.toContain(tempCommandCards[1]);
  });
});
