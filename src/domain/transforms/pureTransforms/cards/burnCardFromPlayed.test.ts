import { tempCommandCards } from '@sampleValues';
import { createTestCard } from '@testing';
import { burnCardFromPlayed } from './burnCardFromPlayed';

import { createOwnedCardState } from '@factories';
/**
 * A rally burns one card from the played pile, and it is gone for good
 * (§10.3.2). The rest of the pile is left to return to hand.
 */
describe('burnCardFromPlayed function', () => {
  it('moves the burnt card from the played pile onto the burnt pile, after any burnt before', () => {
    // Black has played two cards since the last rally, and burnt one at an
    // earlier rally.
    const burnedEarlier = createTestCard();
    const burned = createTestCard();
    const kept = createTestCard();
    const owned = createOwnedCardState({
      burnt: [burnedEarlier],
      played: [burned, kept],
    });

    const result = burnCardFromPlayed(owned, burned);

    // The other played card stays, to come back to hand.
    expect(result.played).toStrictEqual([kept]);
    // The burnt card joins the one burnt before; neither returns.
    expect(result.burnt).toStrictEqual([burnedEarlier, burned]);
  });

  it('burns the played pile’s own copy, not the copy the rally names', () => {
    // Black has played one card; the rally names it, who it is, under
    // another name.
    const played = tempCommandCards[0];
    const owned = createOwnedCardState({ played: [played] });
    const named = { ...played, name: 'Renamed' };

    const result = burnCardFromPlayed(owned, named);

    // The card burnt is the one that was played, as it prints.
    expect(result.burnt).toStrictEqual([played]);
  });

  it('throws when the card named is not in the played pile', () => {
    // The card the rally names is still in Black's hand; a burn comes only
    // from the played pile (§10.2).
    const inHand = createTestCard({ id: 'card-in-hand' });
    const owned = createOwnedCardState({
      inHand: [inHand],
      played: [createTestCard()],
    });

    expect(() => burnCardFromPlayed(owned, inHand)).toThrow(
      "Command card card-in-hand not found in player's played cards",
    );
  });
});
