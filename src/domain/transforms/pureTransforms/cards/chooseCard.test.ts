import type { OwnedCardState } from '@entities';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { chooseCard } from './chooseCard';

/**
 * ChooseCard: Moves a card from a player's hand to awaitingPlay (choosing a card for play).
 */
describe(chooseCard, () => {
  function ownedWithHand(hand: typeof tempCommandCards): OwnedCardState {
    const state = createEmptyGameState();
    return {
      ...state.cardState.black,
      awaitingPlay: null,
      inHand: [...hand],
    };
  }

  it('moves card from hand to awaitingPlay', () => {
    const owned = ownedWithHand([tempCommandCards[0], tempCommandCards[1]]);

    const result = chooseCard(owned, tempCommandCards[0]);

    expect(result.inHand).toStrictEqual([tempCommandCards[1]]);
    expect(result.awaitingPlay).toBe(tempCommandCards[0]);
  });

  it('leaves remaining hand cards in place', () => {
    const owned = ownedWithHand([tempCommandCards[1], tempCommandCards[2]]);

    const result = chooseCard(owned, tempCommandCards[1]);

    expect(result.inHand).toStrictEqual([tempCommandCards[2]]);
    expect(result.awaitingPlay).toBe(tempCommandCards[1]);
  });

  it('throws when card not in hand', () => {
    const owned = ownedWithHand([tempCommandCards[0]]);
    const cardNotInHand = tempCommandCards[1];

    expect(() => chooseCard(owned, cardNotInHand)).toThrow(
      `Card ${tempCommandCards[1].id} not found in player's hand`,
    );
  });
});
