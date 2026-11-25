import { createOwnedCardState } from '@factories';
import { createTestCard } from '@testing';

import { chooseCard } from './chooseCard';

/**
 * In Phase 1 each player picks a card from hand and lays it face down
 * (§4.1.1). Only a card in hand can be chosen (§10.1.1).
 */
describe('chooseCard function', () => {
  it('lays the chosen card face down and leaves the rest of the hand', () => {
    // Black holds two cards and chooses the first.
    const chosen = createTestCard();
    const kept = createTestCard();
    const owned = createOwnedCardState({ inHand: [chosen, kept] });

    const result = chooseCard(owned, chosen);

    // The other card stays in hand.
    expect(result.inHand).toStrictEqual([kept]);
    // The chosen card waits face down for the reveal.
    expect(result.awaitingPlay).toBe(chosen);
  });

  it('lays down the hand’s own copy, not the copy the choice names', () => {
    // The choice names Black's card, who it is, under another name.
    const held = createTestCard({ name: 'As held' });
    const owned = createOwnedCardState({ inHand: [held] });
    const named = { ...held, name: 'Renamed' };

    const result = chooseCard(owned, named);

    // The card face down is the one from the hand, as it prints.
    expect(result.awaitingPlay).toBe(held);
  });

  it('throws when the card is not in the hand', () => {
    // Black's only other card has already been played.
    const played = createTestCard({ id: 'already-played' });
    const owned = createOwnedCardState({
      inHand: [createTestCard()],
      played: [played],
    });

    expect(() => chooseCard(owned, played)).toThrow(
      "Command card already-played not found in player's hand",
    );
  });
});
