import { tempCommandCards } from '@sampleValues';

import { revealHiddenCard } from './revealHiddenCard';

/**
 * RevealHiddenCard: Promotes hidden awaitingPlay to inPlay using event payload.
 */
describe(revealHiddenCard, () => {
  const hiddenBase = {
    awaitingPlay: 'hidden' as const,
    burnt: [],
    discarded: [],
    inHand: ['hidden' as const],
    inPlay: null,
    played: [],
  };

  it('given awaitingPlay is hidden, sets inPlay from payload and clears awaitingPlay', () => {
    const result = revealHiddenCard(hiddenBase, tempCommandCards[0]);

    expect(result.inPlay).toBe(tempCommandCards[0]);
    expect(result.awaitingPlay).toBeNull();
  });

  it('given awaitingPlay is null, throws', () => {
    expect(() =>
      revealHiddenCard(
        { ...hiddenBase, awaitingPlay: null },
        tempCommandCards[0],
      ),
    ).toThrow('Player has no card awaiting play');
  });

  it('given not mutate the original card state', () => {
    const hidden = { ...hiddenBase };
    revealHiddenCard(hidden, tempCommandCards[0]);

    expect(hidden.awaitingPlay).toBe('hidden');
    expect(hidden.inPlay).toBeNull();
  });
});
