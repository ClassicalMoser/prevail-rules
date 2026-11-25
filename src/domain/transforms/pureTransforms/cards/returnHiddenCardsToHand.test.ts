import { createOwnedCardState } from '@factories';
import { createTestCard } from '@testing';

import { returnHiddenCardsToHand } from './returnHiddenCardsToHand';
import { toHiddenCardState } from './toHiddenCardState';

/**
 * A rally takes the played and discard piles back into hand (§10.3.2). A
 * seat that cannot see the hand saw those cards face up, but once in hand
 * they are face down like the rest (§1.4).
 */
describe('returnHiddenCardsToHand function', () => {
  it('appends one hidden placeholder per played and discarded card', () => {
    // The opponent holds one card, has played one, discarded one, and burnt one.
    const burnt = createTestCard();
    const hidden = toHiddenCardState(
      createOwnedCardState({
        burnt: [burnt],
        discarded: [createTestCard()],
        inHand: [createTestCard()],
        played: [createTestCard()],
      }),
    );

    const result = returnHiddenCardsToHand(hidden);

    // Three cards in hand now, none of them known.
    expect(result.inHand).toStrictEqual(['hidden', 'hidden', 'hidden']);
    // Both piles are empty.
    expect(result.played).toStrictEqual([]);
    expect(result.discarded).toStrictEqual([]);
    // The burnt card stays out of the game, face up.
    expect(result.burnt).toStrictEqual([burnt]);
  });
});
