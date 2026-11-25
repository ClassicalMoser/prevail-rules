import { createOwnedCardState } from '@factories';
import { createTestCard } from '@testing';

import { discardShownCardFromHiddenHand } from './discardShownCardFromHiddenHand';
import { toHiddenCardState } from './toHiddenCardState';

/**
 * A commitment and a rout payment are face up (§8, §9.3.2), so a seat that
 * cannot see the player's hand still sees which card was spent.
 */
describe('discardShownCardFromHiddenHand function', () => {
  // The opponent holds two cards this seat cannot see.
  const pile = toHiddenCardState(
    createOwnedCardState({ inHand: [createTestCard(), createTestCard()] }),
  );

  it('takes one hidden card out of the hand and lays the shown card on the discard', () => {
    const shown = createTestCard();

    const next = discardShownCardFromHiddenHand(pile, shown);

    // The hand is one card smaller, and everyone can see which card was spent.
    expect(next.inHand).toStrictEqual(['hidden']);
    expect(next.discarded).toStrictEqual([shown]);
  });

  it('keeps the cards already in the discard', () => {
    // The opponent committed a card earlier, and now shows another.
    const earlier = createTestCard();
    const shown = createTestCard();
    const withEarlier = toHiddenCardState(
      createOwnedCardState({
        discarded: [earlier],
        inHand: [createTestCard()],
      }),
    );

    const next = discardShownCardFromHiddenHand(withEarlier, shown);

    // The new card lies on top of the earlier one.
    expect(next.discarded).toStrictEqual([earlier, shown]);
  });

  it('throws when the hand holds no card to take out', () => {
    // An opponent with no cards left in hand has none to spend.
    const emptyHand = toHiddenCardState(createOwnedCardState({}));

    expect(() =>
      discardShownCardFromHiddenHand(emptyHand, createTestCard()),
    ).toThrow('No hidden card available in hand to discard');
  });
});
