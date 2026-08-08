import type { OwnedCardState } from '@entities';
import { tempCommandCards } from '@sampleValues';

import { toHiddenCardState } from './toHiddenCardState';

describe(toHiddenCardState, () => {
  it('maps hand cards to hidden placeholders of the same count', () => {
    const owned: OwnedCardState = {
      awaitingPlay: null,
      burnt: [],
      discarded: [],
      inHand: [tempCommandCards[0], tempCommandCards[1]],
      inPlay: null,
      played: [],
    };

    expect(toHiddenCardState(owned).inHand).toStrictEqual(['hidden', 'hidden']);
  });

  it('maps awaitingPlay to hidden when present', () => {
    const owned: OwnedCardState = {
      awaitingPlay: tempCommandCards[0],
      burnt: [],
      discarded: [],
      inHand: [tempCommandCards[1]],
      inPlay: null,
      played: [],
    };

    expect(toHiddenCardState(owned).awaitingPlay).toBe('hidden');
  });

  it('preserves public piles and null awaitingPlay', () => {
    const owned: OwnedCardState = {
      awaitingPlay: null,
      burnt: [tempCommandCards[2]],
      discarded: [tempCommandCards[1]],
      inHand: [],
      inPlay: tempCommandCards[0],
      played: [tempCommandCards[3]],
    };

    expect(toHiddenCardState(owned)).toStrictEqual({
      awaitingPlay: null,
      burnt: [tempCommandCards[2]],
      discarded: [tempCommandCards[1]],
      inHand: [],
      inPlay: tempCommandCards[0],
      played: [tempCommandCards[3]],
    });
  });
});
