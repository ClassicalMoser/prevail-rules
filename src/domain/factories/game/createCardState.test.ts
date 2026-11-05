import { tempCommandCards } from '@sampleValues';

import { createCardState } from './createCardState';
import { createOwnedCardState } from './createOwnedCardState';

describe('createCardState function', () => {
  it('is authoritative with both sides empty when given no piles', () => {
    expect.hasAssertions();

    const cardState = createCardState();

    expect(cardState.visibility).toBe('authoritative');
    expect(cardState.black.inHand).toStrictEqual([]);
    expect(cardState.white.inHand).toStrictEqual([]);
  });

  it('takes black first and white second', () => {
    expect.hasAssertions();
    const blackCard = tempCommandCards[0];
    const whiteCard = tempCommandCards[1];

    const cardState = createCardState(
      createOwnedCardState({ inHand: [blackCard] }),
      createOwnedCardState({ inHand: [whiteCard] }),
    );

    expect(cardState.black.inHand).toStrictEqual([blackCard]);
    expect(cardState.white.inHand).toStrictEqual([whiteCard]);
  });

  it('leaves white empty when only black is given', () => {
    expect.hasAssertions();
    const card = tempCommandCards[0];

    const cardState = createCardState(createOwnedCardState({ inHand: [card] }));

    expect(cardState.black.inHand).toStrictEqual([card]);
    expect(cardState.white.inHand).toStrictEqual([]);
  });
});
