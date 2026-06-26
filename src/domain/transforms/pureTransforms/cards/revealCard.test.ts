import { createEmptyGameState } from '@testing';

import { revealCard } from './revealCard';

/**
 * RevealCard: Moves a player's card from awaitingPlay to inPlay.
 */
describe(revealCard, () => {
  it('given move card from awaitingPlay to inPlay', () => {
    const owned = createEmptyGameState().cardState.black;
    const awaitingCard = owned.awaitingPlay;

    if (!awaitingCard) {
      throw new Error('Expected card to be awaiting play');
    }

    const result = revealCard(owned);

    expect(result.inPlay).toBe(awaitingCard);
    expect(result.awaitingPlay).toBeNull();
  });

  it('given if player has no card awaiting play, throws', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      awaitingPlay: null,
    };

    expect(() => revealCard(owned)).toThrow('Player has no card awaiting play');
  });

  it('given not mutate the original card state', () => {
    const owned = createEmptyGameState().cardState.black;
    const originalAwaiting = owned.awaitingPlay;

    revealCard(owned);

    expect(owned.awaitingPlay).toBe(originalAwaiting);
    expect(owned.inPlay).not.toBe(originalAwaiting);
  });
});
