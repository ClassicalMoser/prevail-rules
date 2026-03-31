import { tempCommandCards } from '@sampleValues';
import { describe, expect, it } from 'vitest';
import { createTestCard, getCards, getCardsByCount } from './cardHelpers';

/**
 * getCards: Gets cards from the tempCommandCards array by their indices.
 */
describe('getCards', () => {
  it('given context, returns cards at specified indices', () => {
    const cards = getCards(0, 1, 2);

    expect(cards).toHaveLength(3);
    expect(cards[0]).toBe(tempCommandCards[0]);
    expect(cards[1]).toBe(tempCommandCards[1]);
    expect(cards[2]).toBe(tempCommandCards[2]);
  });

  it('given no indices provided, returns empty array', () => {
    const cards = getCards();

    expect(cards).toEqual([]);
  });

  it('given one index provided, returns single card', () => {
    const cards = getCards(0);

    expect(cards).toHaveLength(1);
    expect(cards[0]).toBe(tempCommandCards[0]);
  });

  it('given error when index is out of bounds (negative), throws', () => {
    expect(() => getCards(-1)).toThrow('Card index -1 is out of bounds');
  });

  it('given error when index is out of bounds (too large), throws', () => {
    expect(() => getCards(tempCommandCards.length)).toThrow(
      `Card index ${tempCommandCards.length} is out of bounds`,
    );
  });

  it('given error when any index is out of bounds, throws', () => {
    expect(() => getCards(0, 1, tempCommandCards.length)).toThrow(
      `Card index ${tempCommandCards.length} is out of bounds`,
    );
  });
});

describe('getCardsByCount', () => {
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

    expect(cards).toEqual([]);
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
    expect(cards).toEqual([...tempCommandCards]);
  });
});

describe('createTestCard', () => {
  it('given no options, returns card with defaults', () => {
    const card = createTestCard();
    expect(card.id).toBe('test-card');
    expect(card.name).toBe('Test Card');
    expect(card.initiative).toBe(1);
    expect(card.command.type).toBe('movement');
  });

  it('given apply round effect modifiers and restrictions', () => {
    const card = createTestCard({
      roundEffectModifiers: [{ type: 'attack', value: 2 }],
      roundEffectRestrictions: { inspirationRangeRestriction: 1 },
    });
    expect(card.roundEffect).toBeDefined();
    expect(card.roundEffect?.modifiers).toHaveLength(1);
    expect(card.roundEffect?.restrictions.inspirationRangeRestriction).toBe(1);
  });

  it('given apply command modifiers', () => {
    const card = createTestCard({
      commandModifiers: [{ type: 'speed', value: 1 }],
    });
    expect(card.command.modifiers).toHaveLength(1);
  });
});
