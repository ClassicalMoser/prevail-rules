import { tempCommandCards } from '@testing';

import { createCardState } from './createCardState';
import { createOwnedCardState } from './createOwnedCardState';

/** The six empty piles a side starts from, written out so the expected value
 * does not come from the factory under test's own neighbour. */
const emptyPiles = {
  awaitingPlay: null,
  burnt: [],
  discarded: [],
  inHand: [],
  inPlay: null,
  played: [],
};

describe('createCardState function', () => {
  it('is authoritative with both sides empty when given no piles', () => {
    expect.hasAssertions();

    const cardState = createCardState();

    expect(cardState).toStrictEqual({
      black: emptyPiles,
      visibility: 'authoritative',
      white: emptyPiles,
    });
  });

  it('sets each side from the piles named for it', () => {
    expect.hasAssertions();
    const blackCard = tempCommandCards[0];
    const whiteCard = tempCommandCards[1];

    const cardState = createCardState({
      black: createOwnedCardState({ inHand: [blackCard] }),
      white: createOwnedCardState({ inHand: [whiteCard] }),
    });

    expect(cardState).toStrictEqual({
      black: { ...emptyPiles, inHand: [blackCard] },
      visibility: 'authoritative',
      white: { ...emptyPiles, inHand: [whiteCard] },
    });
  });

  it('leaves white empty when only black is given', () => {
    expect.hasAssertions();
    const card = tempCommandCards[0];

    const cardState = createCardState({
      black: createOwnedCardState({ inHand: [card] }),
    });

    expect(cardState).toStrictEqual({
      black: { ...emptyPiles, inHand: [card] },
      visibility: 'authoritative',
      white: emptyPiles,
    });
  });
});
