import { createOwnedCardState } from '@factories';
import { createTestCard } from '@testing';

import { returnCardsToHand } from './returnCardsToHand';

/**
 * A rally takes the played pile, less the burnt card, and the entire discard
 * pile back into hand (§10.3.2). Burnt cards never come back.
 */
describe('returnCardsToHand function', () => {
  it('returns the played and discarded cards after those still held, and keeps the burnt pile', () => {
    // Black holds one card, has played one, discarded one, and burnt one.
    const held = createTestCard();
    const played = createTestCard();
    const discarded = createTestCard();
    const burnt = createTestCard();
    const owned = createOwnedCardState({
      burnt: [burnt],
      discarded: [discarded],
      inHand: [held],
      played: [played],
    });

    const result = returnCardsToHand(owned);

    // The hand: what was held, then the played pile, then the discards.
    expect(result.inHand).toStrictEqual([held, played, discarded]);
    // Both piles are empty now.
    expect(result.played).toStrictEqual([]);
    expect(result.discarded).toStrictEqual([]);
    // The burnt card stays out of the game.
    expect(result.burnt).toStrictEqual([burnt]);
  });
});
