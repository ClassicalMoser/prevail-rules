import { createOwnedCardState } from '@factories';
import { createTestCard } from '@testing';

import { revealCard } from './revealCard';

/**
 * The face-down card is turned over and is in play for the round (§4.1.2).
 */
describe('revealCard function', () => {
  it('turns the waiting card face up, in play', () => {
    // Black has laid a card face down.
    const awaitingCard = createTestCard();
    const owned = createOwnedCardState({
      awaitingPlay: awaitingCard,
      inHand: [createTestCard()],
    });

    const result = revealCard(owned);

    // The same card is now in play, and nothing waits.
    expect(result.inPlay).toBe(awaitingCard);
    expect(result.awaitingPlay).toBeNull();
  });

  it('throws when the player has no card waiting', () => {
    // Black has not chosen a card yet.
    const owned = createOwnedCardState({ inHand: [createTestCard()] });

    expect(() => revealCard(owned)).toThrow('Player has no card awaiting play');
  });
});
