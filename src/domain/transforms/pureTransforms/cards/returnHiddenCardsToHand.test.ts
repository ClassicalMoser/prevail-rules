import type { HiddenCardState } from '@game';
import { tempCommandCards } from '@sampleValues';

import { returnHiddenCardsToHand } from './returnHiddenCardsToHand';

describe('returnHiddenCardsToHand function', () => {
  it('appends one hidden placeholder per played and discarded card', () => {
    const hidden: HiddenCardState = {
      awaitingPlay: null,
      burnt: [tempCommandCards[0]],
      discarded: [tempCommandCards[2]],
      inHand: ['hidden'],
      inPlay: null,
      played: [tempCommandCards[1]],
    };

    const result = returnHiddenCardsToHand(hidden);

    expect(result.inHand).toStrictEqual(['hidden', 'hidden', 'hidden']);
    expect(result.played).toStrictEqual([]);
    expect(result.discarded).toStrictEqual([]);
    expect(result.burnt).toStrictEqual([tempCommandCards[0]]);
  });
});
