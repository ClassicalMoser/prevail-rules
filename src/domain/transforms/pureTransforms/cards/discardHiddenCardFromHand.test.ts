import type { HiddenCardState } from '@entities';

import { discardHiddenCardFromHand } from './discardHiddenCardFromHand';

describe(discardHiddenCardFromHand, () => {
  it('removes one hidden placeholder from hand', () => {
    const hidden: HiddenCardState = {
      awaitingPlay: null,
      burnt: [],
      discarded: [],
      inHand: ['hidden', 'hidden'],
      inPlay: null,
      played: [],
    };

    expect(discardHiddenCardFromHand(hidden)).toStrictEqual({
      ...hidden,
      inHand: ['hidden'],
    });
  });

  it('throws when hand is empty', () => {
    const hidden: HiddenCardState = {
      awaitingPlay: null,
      burnt: [],
      discarded: [],
      inHand: [],
      inPlay: null,
      played: [],
    };

    expect(() => discardHiddenCardFromHand(hidden)).toThrow(
      'No hidden card available in hand to discard',
    );
  });
});
