import { createTestCard } from '@testing';

import { createEmptyGameState } from '@factories';

import { revealCard } from './revealCard';

/**
 * RevealCard: Moves a player's card from awaitingPlay to inPlay.
 */
describe(revealCard, () => {
  it('given move card from awaitingPlay to inPlay', () => {
    const awaitingCard = createTestCard({ id: 'awaiting' });
    const owned = {
      ...createEmptyGameState('standard').cardState.black,
      awaitingPlay: awaitingCard,
    };

    const result = revealCard(owned);

    expect(result.inPlay).toBe(awaitingCard);
    expect(result.awaitingPlay).toBeNull();
  });

  it('given if player has no card awaiting play, throws', () => {
    const owned = {
      ...createEmptyGameState('standard').cardState.black,
      awaitingPlay: null,
    };

    expect(() => revealCard(owned)).toThrow('Player has no card awaiting play');
  });

  it('given not mutate the original card state', () => {
    const originalAwaiting = createTestCard({ id: 'awaiting' });
    const owned = {
      ...createEmptyGameState('standard').cardState.black,
      awaitingPlay: originalAwaiting,
    };

    revealCard(owned);

    expect(owned.awaitingPlay).toBe(originalAwaiting);
    expect(owned.inPlay).not.toBe(originalAwaiting);
  });
});
