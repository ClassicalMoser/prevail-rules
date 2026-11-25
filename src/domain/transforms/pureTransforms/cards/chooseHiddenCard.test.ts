import { createOwnedCardState } from '@factories';
import { createTestCard } from '@testing';

import { chooseHiddenCard } from './chooseHiddenCard';
import { toHiddenCardState } from './toHiddenCardState';

/**
 * A card is chosen face down in secret (§4.1.1): a seat that cannot see the
 * chooser's hand sees only that one card left it.
 */
describe('chooseHiddenCard function', () => {
  it('moves one hidden card from hand to awaitingPlay', () => {
    // The opponent holds two cards this seat cannot see.
    const hidden = toHiddenCardState(
      createOwnedCardState({ inHand: [createTestCard(), createTestCard()] }),
    );

    const result = chooseHiddenCard(hidden);

    // One card fewer in hand, and one face down, still unknown.
    expect(result.inHand).toStrictEqual(['hidden']);
    expect(result.awaitingPlay).toBe('hidden');
  });

  it('throws when hand is empty', () => {
    // An opponent with no cards left has nothing to lay down.
    const hidden = toHiddenCardState(createOwnedCardState({}));

    expect(() => chooseHiddenCard(hidden)).toThrow(
      'No hidden card available in hand',
    );
  });

  it('throws when awaitingPlay is already set', () => {
    // The opponent has already laid a card face down this round.
    const hidden = toHiddenCardState(
      createOwnedCardState({
        awaitingPlay: createTestCard(),
        inHand: [createTestCard()],
      }),
    );

    expect(() => chooseHiddenCard(hidden)).toThrow(
      'Hidden player already has a card awaiting play',
    );
  });
});
