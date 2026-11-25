import { createOwnedCardState } from '@factories';
import { createTestCard } from '@testing';

import { revealHiddenCard } from './revealHiddenCard';
import { toHiddenCardState } from './toHiddenCardState';

/**
 * The opponent's face-down card is turned over and is in play for the round
 * (§4.1.2). This seat never knew which card it was, so the reveal names it.
 */
describe('revealHiddenCard function', () => {
  it('puts the revealed card in play, and nothing waits', () => {
    // The opponent has laid a card face down.
    const hidden = toHiddenCardState(
      createOwnedCardState({
        awaitingPlay: createTestCard(),
        inHand: [createTestCard()],
      }),
    );
    const revealed = createTestCard();

    const result = revealHiddenCard(hidden, revealed);

    // The reveal's card is in play.
    expect(result.inPlay).toBe(revealed);
    expect(result.awaitingPlay).toBeNull();
  });

  it('throws when the player has no card waiting', () => {
    // The opponent has not chosen a card yet.
    const hidden = toHiddenCardState(
      createOwnedCardState({ inHand: [createTestCard()] }),
    );

    expect(() => revealHiddenCard(hidden, createTestCard())).toThrow(
      'Player has no card awaiting play',
    );
  });
});
