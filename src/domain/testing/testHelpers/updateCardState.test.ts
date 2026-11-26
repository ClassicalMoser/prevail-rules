import { tempCommandCards } from '@sampleValues';

import { updateCardState } from './updateCardState';

import { createEmptyGameState } from '@factories';
/** A game's whole card state swapped, for setup; production writes one player's cards at a time. */
describe('updateCardState function', () => {
  it('puts the cards a spec sets out into the game, the rest kept', () => {
    const state = createEmptyGameState('standard');

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

  it('leaves the game it was given as it was', () => {
    const state = createEmptyGameState('standard');
    const originalCardState = state.cardState;

    updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inHand: [tempCommandCards[0]] },
    });

    expect(state.cardState).toBe(originalCardState);
    expect(state.cardState.black.inHand).not.toContain(tempCommandCards[0]);
  });
});
