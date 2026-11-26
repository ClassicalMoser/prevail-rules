import { tempCommandCards } from '@sampleValues';
import { getCardsByCount } from './getCardsByCount';

describe('getCardsByCount function', () => {
  it('given context, returns specified number of cards', () => {
    const cards = getCardsByCount(3);

    expect(cards).toHaveLength(3);
    expect(cards[0]).toBe(tempCommandCards[0]);
    expect(cards[1]).toBe(tempCommandCards[1]);
    expect(cards[2]).toBe(tempCommandCards[2]);
  });

  it('given context, returns single card by default', () => {
    const cards = getCardsByCount();

    expect(cards).toHaveLength(1);
    expect(cards[0]).toBe(tempCommandCards[0]);
  });

  it('given count is 0, returns empty array', () => {
    const cards = getCardsByCount(0);

    expect(cards).toStrictEqual([]);
  });

  it('given error when count is negative, throws', () => {
    expect(() => getCardsByCount(-1)).toThrow(
      'Count must be non-negative, got -1',
    );
  });

  it('given error when count exceeds available cards, throws', () => {
    expect(() => getCardsByCount(tempCommandCards.length + 1)).toThrow(
      `Requested ${tempCommandCards.length + 1} cards but only ${tempCommandCards.length} are available`,
    );
  });

  it('given count equals available cards, returns all available cards', () => {
    const cards = getCardsByCount(tempCommandCards.length);

    expect(cards).toHaveLength(tempCommandCards.length);
    expect(cards).toStrictEqual([...tempCommandCards]);
  });
});
