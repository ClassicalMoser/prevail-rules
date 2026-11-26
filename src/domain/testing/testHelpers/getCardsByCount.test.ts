import { tempCommandCards } from '@sampleValues';

import { getCardsByCount } from './getCardsByCount';

/** A hand of so many stand-in cards, the first in the catalog. */
describe('getCardsByCount function', () => {
  it('deals the first cards of the catalog', () => {
    const cards = getCardsByCount(3);

    expect(cards).toStrictEqual(tempCommandCards.slice(0, 3));
  });

  it('deals one card when no count is given', () => {
    expect(getCardsByCount()).toStrictEqual([tempCommandCards[0]]);
  });

  it('deals an empty hand for a count of zero', () => {
    expect(getCardsByCount(0)).toStrictEqual([]);
  });

  it('deals the whole catalog when asked for all of it', () => {
    expect(getCardsByCount(tempCommandCards.length)).toStrictEqual([
      ...tempCommandCards,
    ]);
  });

  it('refuses a count below zero', () => {
    expect(() => getCardsByCount(-1)).toThrow(
      'Count must be non-negative, got -1',
    );
  });

  it('refuses more cards than the catalog holds', () => {
    expect(() => getCardsByCount(tempCommandCards.length + 1)).toThrow(
      `Requested ${tempCommandCards.length + 1} cards but only ${tempCommandCards.length} are available`,
    );
  });
});
