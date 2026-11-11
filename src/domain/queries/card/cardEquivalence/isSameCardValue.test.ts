import { createTestCard } from '@testing';

import { isSameCardValue } from './isSameCardValue';

describe('isSameCardValue function', () => {
  const held = createTestCard({ cost: 10, modifiers: ['attack', 'speed'] });

  it('holds for a faithful copy of the card held', () => {
    expect(isSameCardValue(held, structuredClone(held))).toStrictEqual({
      result: true,
    });
  });

  it('ignores the order its commit stats were written in', () => {
    // A card that may be committed for Attack or Speed is the same card
    // whichever it lists first.
    const reordered = { ...held, modifiers: held.modifiers.toReversed() };

    expect(isSameCardValue(held, reordered).result).toBe(true);
  });

  it('refuses a copy that lists a commit stat more often than the card does', () => {
    // Each listed stat is +1 when the card is committed (§8.4), so a copy
    // listing Attack twice would count double.
    const inflated = { ...held, modifiers: ['attack', 'attack'] as const };

    expect(
      isSameCardValue(held, {
        ...inflated,
        modifiers: [...inflated.modifiers],
      }),
    ).toStrictEqual({
      errorReason: `Card ${held.id} differs from the card held in its commit stats`,
      result: false,
    });
  });

  it('refuses a copy with a different cost, naming the cost', () => {
    expect(isSameCardValue(held, { ...held, cost: 0 })).toStrictEqual({
      errorReason: `Card ${held.id} differs from the card held in its cost`,
      result: false,
    });
  });

  it('refuses a different card outright, as a different card', () => {
    const other = createTestCard();

    expect(isSameCardValue(held, other)).toStrictEqual({
      errorReason: `Cards ${held.id} and ${other.id} are different cards`,
      result: false,
    });
  });
});
