import { tempCommandCards } from '@sampleValues';
import { createTestCard } from '@testing';
import { discardCardsFromHand } from './discardCardsFromHand';

import { createEmptyGameState, createOwnedCardState } from '@factories';
/**
 * A card committed for +1 (§8.1) or paid for a rout's Morale (§9.3.2) leaves
 * the hand for the discard pile, where it waits for the next rally.
 */
describe('discardCardsFromHand function', () => {
  it('moves the named cards from hand onto the discard pile, after those already there', () => {
    // Black holds three cards and has discarded one earlier; a rout costs two.
    const earlier = createTestCard();
    const first = createTestCard();
    const kept = createTestCard();
    const second = createTestCard();
    const owned = createOwnedCardState({
      discarded: [earlier],
      inHand: [first, kept, second],
    });

    const result = discardCardsFromHand(owned, [first.id, second.id]);

    // The card not named stays in hand.
    expect(result.inHand).toStrictEqual([kept]);
    // The two paid go on top of the earlier discard.
    expect(result.discarded).toStrictEqual([earlier, first, second]);
  });

  it('lays the cards on the discard pile in the order they are named, not the order they were held', () => {
    // Black holds three cards, and names the last before the first.
    const owned = {
      ...createEmptyGameState('standard').cardState.black,
      discarded: [],
      inHand: [tempCommandCards[0], tempCommandCards[1], tempCommandCards[2]],
    };

    const result = discardCardsFromHand(owned, [
      tempCommandCards[2].id,
      tempCommandCards[0].id,
    ]);

    // The pile follows the choice, as a seat that cannot see Black's hand
    // lays the shown cards down, so every view of the pile agrees.
    expect(result.discarded).toStrictEqual([
      tempCommandCards[2],
      tempCommandCards[0],
    ]);
    // The card not named stays in hand.
    expect(result.inHand).toStrictEqual([tempCommandCards[1]]);
  });

  it('throws when a card named is not in the hand', () => {
    // Black's other card has already been played, so it cannot be discarded
    // from hand.
    const played = createTestCard({ id: 'already-played' });
    const owned = createOwnedCardState({
      inHand: [createTestCard()],
      played: [played],
    });

    expect(() => discardCardsFromHand(owned, [played.id])).toThrow(
      'Card already-played is not in the hand',
    );
  });

  it('throws when a card is named twice', () => {
    // A card is in one place at a time; naming it twice would put it on the
    // discard pile twice while it leaves the hand once.
    const named = createTestCard();
    const kept = createTestCard();
    const owned = createOwnedCardState({ inHand: [named, kept] });

    expect(() => discardCardsFromHand(owned, [named.id, named.id])).toThrow(
      `Card ${named.id} is named more than once`,
    );
  });
});
