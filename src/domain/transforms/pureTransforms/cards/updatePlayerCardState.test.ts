import { createEmptyGameState, createOwnedCardState } from '@factories';
import { createTestCard } from '@testing';

import { updatePlayerCardState } from './updatePlayerCardState';

/**
 * One player's cards, where this view can see them, written into the game;
 * the other player's cards are left as they were.
 */
describe('updatePlayerCardState function', () => {
  it("writes the named player's cards and leaves the other's", () => {
    const state = createEmptyGameState('standard');
    // Black's cards, one card in hand.
    const card = createTestCard();
    const blackCards = createOwnedCardState({ inHand: [card] });

    const newState = updatePlayerCardState(state, 'black', blackCards);

    // Black holds the card; White's piles are the very same object.
    expect(newState.cardState.black.inHand).toStrictEqual([card]);
    expect(newState.cardState.white).toBe(state.cardState.white);
  });
});
