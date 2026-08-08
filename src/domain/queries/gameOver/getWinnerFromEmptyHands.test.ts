import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, updateCardState } from '@testing';

import { getWinnerFromEmptyHands } from './getWinnerFromEmptyHands';

describe(getWinnerFromEmptyHands, () => {
  it('returns undefined when both hands have cards', () => {
    const state = createEmptyGameState();

    expect(getWinnerFromEmptyHands(state)).toBeUndefined();
  });

  it('returns black when white hand is empty', () => {
    const base = createEmptyGameState();
    const state = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });

    expect(getWinnerFromEmptyHands(state)).toBe('black');
  });

  it('returns white when black hand is empty', () => {
    const base = createEmptyGameState();
    const state = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [] },
    });

    expect(getWinnerFromEmptyHands(state)).toBe('white');
  });

  it('returns null (draw) when both hands are empty', () => {
    const base = createEmptyGameState();
    const state = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [] },
      white: { ...base.cardState.white, inHand: [] },
    });

    expect(getWinnerFromEmptyHands(state)).toBeNull();
  });

  it('treats hand length only (ignores other card zones)', () => {
    const base = createEmptyGameState();
    const state = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inHand: [],
        played: [tempCommandCards[4]],
      },
    });

    expect(getWinnerFromEmptyHands(state)).toBe('white');
  });
});
