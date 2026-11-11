import type { HiddenCardState } from '@game';
import { createTestCard } from '@testing';

import { discardShownCardFromHiddenHand } from './discardShownCardFromHiddenHand';

describe('discardShownCardFromHiddenHand function', () => {
  const pile: HiddenCardState = {
    awaitingPlay: null,
    burnt: [],
    discarded: [],
    inHand: ['hidden', 'hidden'],
    inPlay: null,
    played: [],
  };

  it('takes one hidden card out of the hand and lays the shown card on the discard', () => {
    const shown = createTestCard();

    const next = discardShownCardFromHiddenHand(pile, shown);

    // The hand is one card smaller, and everyone can see which card was spent.
    expect(next.inHand).toStrictEqual(['hidden']);
    expect(next.discarded).toStrictEqual([shown]);
  });

  it('keeps the cards already in the discard', () => {
    const earlier = createTestCard();
    const shown = createTestCard();

    const next = discardShownCardFromHiddenHand(
      { ...pile, discarded: [earlier] },
      shown,
    );

    expect(next.discarded).toStrictEqual([earlier, shown]);
  });

  it('throws when the hand holds no card to take out', () => {
    expect(() =>
      discardShownCardFromHiddenHand({ ...pile, inHand: [] }, createTestCard()),
    ).toThrow('No hidden card available in hand to discard');
  });
});
