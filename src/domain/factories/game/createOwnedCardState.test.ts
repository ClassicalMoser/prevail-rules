import { tempCommandCards } from '@sampleValues';

import { createOwnedCardState } from './createOwnedCardState';

describe('createOwnedCardState function', () => {
  it('leaves every pile empty when no pile is named', () => {
    expect.hasAssertions();

    const piles = createOwnedCardState();

    expect(piles).toStrictEqual({
      awaitingPlay: null,
      burnt: [],
      discarded: [],
      inHand: [],
      inPlay: null,
      played: [],
    });
  });

  it('sets the named pile and leaves the others empty', () => {
    expect.hasAssertions();
    const card = tempCommandCards[0];

    const piles = createOwnedCardState({ burnt: [card] });

    expect(piles.burnt).toStrictEqual([card]);
    expect(piles.inHand).toStrictEqual([]);
    expect(piles.awaitingPlay).toBeNull();
  });
});
