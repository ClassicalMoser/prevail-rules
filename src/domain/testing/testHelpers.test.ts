import { commandCards } from '@sampleValues';
import { describe, expect, it } from 'vitest';
import { getCards, getCardsByCount } from './testHelpers';

describe('getCards', () => {
  it('should return cards at specified indices', () => {
    const cards = getCards(0, 1, 2);

    expect(cards).toHaveLength(3);
    expect(cards[0]).toBe(commandCards[0]);
    expect(cards[1]).toBe(commandCards[1]);
    expect(cards[2]).toBe(commandCards[2]);
  });

  it('should return empty array when no indices provided', () => {
    const cards = getCards();

    expect(cards).toEqual([]);
  });

  it('should return single card when one index provided', () => {
    const cards = getCards(0);

    expect(cards).toHaveLength(1);
    expect(cards[0]).toBe(commandCards[0]);
  });

  it('should throw error when index is out of bounds (negative)', () => {
    expect(() => getCards(-1)).toThrow('Card index -1 is out of bounds');
  });

  it('should throw error when index is out of bounds (too large)', () => {
    expect(() => getCards(commandCards.length)).toThrow(
      `Card index ${commandCards.length} is out of bounds`,
    );
  });

  it('should throw error when any index is out of bounds', () => {
    expect(() => getCards(0, 1, commandCards.length)).toThrow(
      `Card index ${commandCards.length} is out of bounds`,
    );
  });
});

describe('getCardsByCount', () => {
  it('should return specified number of cards', () => {
    const cards = getCardsByCount(3);

    expect(cards).toHaveLength(3);
    expect(cards[0]).toBe(commandCards[0]);
    expect(cards[1]).toBe(commandCards[1]);
    expect(cards[2]).toBe(commandCards[2]);
  });

  it('should return single card by default', () => {
    const cards = getCardsByCount();

    expect(cards).toHaveLength(1);
    expect(cards[0]).toBe(commandCards[0]);
  });

  it('should return empty array when count is 0', () => {
    const cards = getCardsByCount(0);

    expect(cards).toEqual([]);
  });

  it('should throw error when count is negative', () => {
    expect(() => getCardsByCount(-1)).toThrow(
      'Count must be non-negative, got -1',
    );
  });

  it('should throw error when count exceeds available cards', () => {
    expect(() => getCardsByCount(commandCards.length + 1)).toThrow(
      `Requested ${commandCards.length + 1} cards but only ${commandCards.length} are available`,
    );
  });

  it('should return all available cards when count equals available cards', () => {
    const cards = getCardsByCount(commandCards.length);

    expect(cards).toHaveLength(commandCards.length);
    expect(cards).toEqual([...commandCards]);
  });
});

