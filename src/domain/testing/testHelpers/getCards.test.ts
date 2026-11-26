import { tempCommandCards } from '@sampleValues';

import { getCards } from './getCards';

/** Stand-in cards from the catalog, named by their place in it. */
describe('getCards function', () => {
  it('deals the catalog’s own cards in the order asked', () => {
    const cards = getCards(2, 0);

    expect(cards).toStrictEqual([tempCommandCards[2], tempCommandCards[0]]);
  });

  it('deals nothing when asked for nothing', () => {
    expect(getCards()).toStrictEqual([]);
  });

  it('refuses a place before the first card', () => {
    expect(() => getCards(-1)).toThrow(
      'Command card index -1 is out of bounds',
    );
  });

  it('refuses a place past the last card, wherever it comes in the list', () => {
    expect(() => getCards(0, 1, tempCommandCards.length)).toThrow(
      `Command card index ${tempCommandCards.length} is out of bounds`,
    );
  });
});
