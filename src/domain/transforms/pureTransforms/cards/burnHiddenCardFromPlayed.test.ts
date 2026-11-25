import { tempCommandCards } from '@sampleValues';
import { createOwnedCardState } from '@factories';
import { createTestCard } from '@testing';

import { burnHiddenCardFromPlayed } from './burnHiddenCardFromPlayed';
import { toHiddenCardState } from './toHiddenCardState';

/**
 * A rally burns one played card (§10.3.2). The played pile is face up, so a
 * seat that cannot see the rallying player's hand still burns the very card,
 * and the hand stays as it was.
 */
describe('burnHiddenCardFromPlayed function', () => {
  it('moves the matching played card onto the public burnt pile', () => {
    // The opponent holds one card face down and has played two.
    const burned = createTestCard();
    const kept = createTestCard();
    const hidden = toHiddenCardState(
      createOwnedCardState({
        inHand: [createTestCard()],
        played: [burned, kept],
      }),
    );

    const result = burnHiddenCardFromPlayed(hidden, burned);

    // The other played card stays, to come back to hand.
    expect(result.played).toStrictEqual([kept]);
    // Everyone sees which card burnt.
    expect(result.burnt).toStrictEqual([burned]);
    // The burn does not touch the hand.
    expect(result.inHand).toStrictEqual(['hidden']);
  });

  it('burns the played pile’s own copy, not the copy the rally names', () => {
    // The opponent's played card is face up here; the rally names it, who it
    // is, under another name.
    const played = tempCommandCards[0];
    const hidden = toHiddenCardState(
      createOwnedCardState({ played: [played] }),
    );
    const named = { ...played, name: 'Renamed' };

    const result = burnHiddenCardFromPlayed(hidden, named);

    // The card burnt is the one that was played, as it prints.
    expect(result.burnt).toStrictEqual([played]);
  });

  it('throws when the card is not in the played pile', () => {
    // The rally names a card the opponent never played.
    const hidden = toHiddenCardState(
      createOwnedCardState({ played: [createTestCard()] }),
    );
    const neverPlayed = createTestCard({ id: 'never-played' });

    expect(() => burnHiddenCardFromPlayed(hidden, neverPlayed)).toThrow(
      "Command card never-played not found in player's played cards",
    );
  });
});
