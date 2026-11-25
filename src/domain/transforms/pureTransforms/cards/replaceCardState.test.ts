import {
  createCardState,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import { createTestCard } from '@testing';

import { replaceCardState } from './replaceCardState';

/**
 * Cards move between piles for many reasons, and each caller says how; this
 * only writes both players' cards back into the game.
 */
describe('replaceCardState function', () => {
  it('writes the card state into the game and leaves everything else', () => {
    const state = createEmptyGameState('standard');
    // Each side now holds one card.
    const blackCard = createTestCard();
    const whiteCard = createTestCard();
    const cardState = createCardState({
      black: createOwnedCardState({ inHand: [blackCard] }),
      white: createOwnedCardState({ inHand: [whiteCard] }),
    });

    const result = replaceCardState(state, cardState);

    // The game holds the new cards …
    expect(result.cardState).toBe(cardState);
    // … and the same board and round as before.
    expect(result.boardState).toBe(state.boardState);
    expect(result.currentRoundState).toBe(state.currentRoundState);
  });
});
