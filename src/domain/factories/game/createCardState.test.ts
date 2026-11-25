import { tempCommandCards } from '@sampleValues';
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
  it('is authoritative, with each side holding the piles it is given', () => {
    const cardState = createCardState({
      black: createOwnedCardState({}),
      white: createOwnedCardState({}),
    });

    expect(cardState).toStrictEqual({
      black: emptyPiles,
      visibility: 'authoritative',
      white: emptyPiles,
    });
  });

  it('sets each side from the piles named for it', () => {
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
});
