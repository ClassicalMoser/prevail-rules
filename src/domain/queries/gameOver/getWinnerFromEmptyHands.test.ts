import { tempCommandCards } from '@sampleValues';
import { createTestCard, updateCardState } from '@testing';

import { getWinnerFromEmptyHands } from './getWinnerFromEmptyHands';

import { createEmptyGameState } from '@factories';
describe(getWinnerFromEmptyHands, () => {
  it('returns undefined when both hands have cards', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inHand: [createTestCard({ id: 'black-hand' })],
      },
      white: {
        ...base.cardState.white,
        inHand: [createTestCard({ id: 'white-hand' })],
      },
    });

    expect(getWinnerFromEmptyHands(state)).toBeUndefined();
  });

  it('returns black when white hand is empty', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inHand: [createTestCard({ id: 'black-hand' })],
      },
      white: { ...base.cardState.white, inHand: [] },
    });

    expect(getWinnerFromEmptyHands(state)).toBe('black');
  });

  it('returns white when black hand is empty', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [] },
      white: {
        ...base.cardState.white,
        inHand: [createTestCard({ id: 'white-hand' })],
      },
    });

    expect(getWinnerFromEmptyHands(state)).toBe('white');
  });

  it('returns null (draw) when both hands are empty', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [] },
      white: { ...base.cardState.white, inHand: [] },
    });

    expect(getWinnerFromEmptyHands(state)).toBeNull();
  });

  it('treats hand length only (ignores other card zones)', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inHand: [],
        played: [tempCommandCards[4]],
      },
      white: {
        ...base.cardState.white,
        inHand: [createTestCard({ id: 'white-hand' })],
      },
    });

    expect(getWinnerFromEmptyHands(state)).toBe('white');
  });
});
