import { tempCommandCards } from '@sampleValues';
import { getCards } from './getCards';

/**
 * GetCards: Gets cards from the tempCommandCards array by their indices.
 */
describe('getCards function', () => {
  it('given context, returns cards at specified indices', () => {
    const cards = getCards(0, 1, 2);

    expect(cards).toHaveLength(3);
    expect(cards[0]).toBe(tempCommandCards[0]);
    expect(cards[1]).toBe(tempCommandCards[1]);
    expect(cards[2]).toBe(tempCommandCards[2]);
  });

  it('given no indices provided, returns empty array', () => {
    const cards = getCards();

    expect(cards).toStrictEqual([]);
  });

  it('given one index provided, returns single card', () => {
    const cards = getCards(0);

    expect(cards).toHaveLength(1);
    expect(cards[0]).toBe(tempCommandCards[0]);
  });

  it('given error when index is out of bounds (negative), throws', () => {
    expect(() => getCards(-1)).toThrow(
      'Command card index -1 is out of bounds',
    );
  });

  it('given error when index is out of bounds (too large), throws', () => {
    expect(() => getCards(tempCommandCards.length)).toThrow(
      `Command card index ${tempCommandCards.length} is out of bounds`,
    );
  });

  it('given error when any index is out of bounds, throws', () => {
    expect(() => getCards(0, 1, tempCommandCards.length)).toThrow(
      `Command card index ${tempCommandCards.length} is out of bounds`,
    );
  });
});
