import { createOwnedCardState } from '@factories';
import { createTestCard } from '@testing';

import { toHiddenCardState } from './toHiddenCardState';

/**
 * Hands are secret, and so is a card laid face down until it is revealed
 * (§1.4). Everything else about a player's cards is on the table.
 */
describe('toHiddenCardState function', () => {
  it('turns the hand face down, keeping how many cards it holds', () => {
    const owned = createOwnedCardState({
      inHand: [createTestCard(), createTestCard()],
    });

    // Two cards, neither known.
    expect(toHiddenCardState(owned).inHand).toStrictEqual(['hidden', 'hidden']);
  });

  it('turns the waiting card face down', () => {
    const owned = createOwnedCardState({
      awaitingPlay: createTestCard(),
      inHand: [createTestCard()],
    });

    // A card is waiting, but not which.
    expect(toHiddenCardState(owned).awaitingPlay).toBe('hidden');
  });

  it('keeps the face-up cards as they are, and no waiting card where there is none', () => {
    // A card in hand, one in play and one in each pile; nothing waiting.
    const inPlay = createTestCard();
    const played = createTestCard();
    const discarded = createTestCard();
    const burnt = createTestCard();
    const owned = createOwnedCardState({
      burnt: [burnt],
      discarded: [discarded],
      inHand: [createTestCard()],
      inPlay,
      played: [played],
    });

    // Only the hand is turned face down.
    expect(toHiddenCardState(owned)).toStrictEqual({
      awaitingPlay: null,
      burnt: [burnt],
      discarded: [discarded],
      inHand: ['hidden'],
      inPlay,
      played: [played],
    });
  });
});
