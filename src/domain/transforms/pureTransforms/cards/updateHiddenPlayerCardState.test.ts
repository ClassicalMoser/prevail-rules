import { tempCommandCards } from '@sampleValues';

import { updateHiddenPlayerCardState } from './updateHiddenPlayerCardState';

import { createEmptyGameState } from '@factories';
/**
 * UpdateHiddenPlayerCardState: Updates the unowned (hidden) card slice.
 */
describe(updateHiddenPlayerCardState, () => {
  it('given whiteSeen, updates black hidden slice', () => {
    const base = createEmptyGameState('standard');
    const state = {
      ...base,
      cardState: {
        visibility: 'whiteSeen' as const,
        white: base.cardState.white,
        black: {
          awaitingPlay: 'hidden' as const,
          burnt: [],
          discarded: [],
          inHand: ['hidden' as const],
          inPlay: null,
          played: [],
        },
      },
    };

    const newBlack = {
      ...state.cardState.black,
      awaitingPlay: null,
      inPlay: tempCommandCards[0],
    };

    const newState = updateHiddenPlayerCardState(state, 'black', newBlack);

    expect(newState.cardState.black).toStrictEqual(newBlack);
    expect(newState.cardState.white).toBe(state.cardState.white);
  });

  it('given blackSeen, updates white hidden slice', () => {
    const base = createEmptyGameState('standard');
    const state = {
      ...base,
      cardState: {
        visibility: 'blackSeen' as const,
        black: base.cardState.black,
        white: {
          awaitingPlay: 'hidden' as const,
          burnt: [],
          discarded: [],
          inHand: ['hidden' as const],
          inPlay: null,
          played: [],
        },
      },
    };

    const newWhite = {
      ...state.cardState.white,
      awaitingPlay: null,
      inPlay: tempCommandCards[1],
    };

    const newState = updateHiddenPlayerCardState(state, 'white', newWhite);

    expect(newState.cardState.white).toStrictEqual(newWhite);
    expect(newState.cardState.black).toBe(state.cardState.black);
  });

  it('given not mutate the original state', () => {
    const base = createEmptyGameState('standard');
    const state = {
      ...base,
      cardState: {
        visibility: 'whiteSeen' as const,
        white: base.cardState.white,
        black: {
          awaitingPlay: 'hidden' as const,
          burnt: [],
          discarded: [],
          inHand: ['hidden' as const],
          inPlay: null,
          played: [],
        },
      },
    };
    const originalBlack = state.cardState.black;

    updateHiddenPlayerCardState(state, 'black', {
      ...state.cardState.black,
      awaitingPlay: null,
      inPlay: tempCommandCards[0],
    });

    expect(state.cardState.black).toBe(originalBlack);
    expect(state.cardState.black.awaitingPlay).toBe('hidden');
  });
});
