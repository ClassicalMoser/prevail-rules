import { createTestCard } from '@testing';

import { isSameCard } from './isSameCard';

describe('isSameCard function', () => {
  it('holds for two copies of one card written out separately', () => {
    const card = createTestCard();

    expect(isSameCard(card, structuredClone(card))).toBe(true);
  });

  it('holds for two copies that disagree on stats, which it does not judge', () => {
    // Only the id names the card; isSameCardValue compares the rest.
    const card = createTestCard({ cost: 10 });

    expect(isSameCard(card, { ...card, cost: 20 })).toBe(true);
  });

  it('fails for two different cards', () => {
    const first = createTestCard();
    const second = createTestCard();

    expect(isSameCard(first, second)).toBe(false);
  });
});
