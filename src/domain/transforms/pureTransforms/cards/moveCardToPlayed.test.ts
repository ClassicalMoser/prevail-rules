import { createOwnedCardState } from '@factories';
import { createTestCard } from '@testing';

import { moveCardToPlayed } from './moveCardToPlayed';

/**
 * At Cleanup this round's card leaves play for the played pile (§4.5.1),
 * where a rally will later find it.
 */
describe('moveCardToPlayed function', () => {
  it('puts the card in play on top of the cards played in earlier rounds', () => {
    // Black played one card in an earlier round, and has this round's in play.
    const earlier = createTestCard();
    const thisRound = createTestCard();
    const owned = createOwnedCardState({
      inPlay: thisRound,
      played: [earlier],
    });

    const result = moveCardToPlayed(owned);

    // Nothing is in play any more, and the card joins the played pile.
    expect(result.inPlay).toBeNull();
    expect(result.played).toStrictEqual([earlier, thisRound]);
  });

  it('throws when no card is in play', () => {
    // Every round reveals a card for each player before Cleanup (§4.1.2),
    // so a player with no card in play here is a fault, not a card to skip.
    const owned = createOwnedCardState({ inHand: [createTestCard()] });

    expect(() => moveCardToPlayed(owned)).toThrow('Player has no card in play');
  });
});
