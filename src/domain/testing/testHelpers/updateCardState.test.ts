import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing/createEmptyGameState';

import { updateCardState } from './updateCardState';

/**
 * UpdateCardState: Creates a new game state with the card state updated.
 */
describe(updateCardState, () => {
  it('given update card state', () => {
    const state = createEmptyGameState();

    const newState = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inHand: [tempCommandCards[0]],
      },
    });

    expect(newState.cardState.black.inHand).toStrictEqual([
      tempCommandCards[0],
    ]);
    expect(newState.cardState.white).toBe(state.cardState.white);
  });

  it('given not mutate the original state', () => {
    const state = createEmptyGameState();
    const originalCardState = state.cardState;

    updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inHand: [tempCommandCards[0]] },
    });

    expect(state.cardState).toBe(originalCardState);
    expect(state.cardState.black.inHand).not.toContain(tempCommandCards[0]);
  });
});
