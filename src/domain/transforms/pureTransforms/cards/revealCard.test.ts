import { createEmptyGameState } from '@testing';

import { revealCard } from './revealCard';

/**
 * RevealCard: Moves a player's card from awaitingPlay to inPlay.
 */
describe(revealCard, () => {
  it('given move card from awaitingPlay to inPlay', () => {
    const gameState = createEmptyGameState();
    const { cardState } = gameState;
    const blackCard = cardState.black.awaitingPlay;

    if (!blackCard) {
      throw new Error('Expected black card to be awaiting play');
    }

    const newCardState = revealCard(cardState, 'black');

    expect(newCardState.black.inPlay).toBe(blackCard);
    expect(newCardState.black.awaitingPlay).toBeNull();
    expect(newCardState.white).toBe(cardState.white);
  });

  it('given if player has no card awaiting play, throws', () => {
    const gameState = createEmptyGameState();
    const { cardState } = gameState;
    const cardStateWithoutAwaiting = {
      ...cardState,
      black: {
        ...cardState.black,
        awaitingPlay: null,
      },
    };

    expect(() => revealCard(cardStateWithoutAwaiting, 'black')).toThrow(
      'Black player has no card awaiting play',
    );
  });

  it('given not mutate the original card state', () => {
    const gameState = createEmptyGameState();
    const { cardState } = gameState;
    const originalBlackAwaiting = cardState.black.awaitingPlay;

    revealCard(cardState, 'black');

    expect(cardState.black.awaitingPlay).toBe(originalBlackAwaiting);
    expect(cardState.black.inPlay).not.toBe(originalBlackAwaiting);
  });
});
