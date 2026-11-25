import { createTestCard, updateCardState } from '@testing';

import { findCardInPlay } from './findCardInPlay';
import { getCardInPlay } from './getCardInPlay';

import { createEmptyGameState } from '@factories';

/**
 * Each player's revealed card grants the round's orders and lies face up for
 * every viewer (§4.1.2, §4.1.6). Before the reveal there is none.
 */
describe('getCardInPlay function', () => {
  it('reads the card a player has in play', () => {
    // Black's card has been revealed and lies face up in play.
    const card = createTestCard();
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: card },
    });

    // Both readers give that card: the insisting one and its total twin.
    expect(getCardInPlay(state.cardState, 'black')).toBe(card);
    expect(findCardInPlay(state.cardState, 'black')).toBe(card);
  });

  it('throws before the cards are revealed, where a caller that insists has made a mistake', () => {
    // A new game: no card has been revealed yet.
    const state = createEmptyGameState('standard');

    // The total twin answers that there is no card yet.
    expect(findCardInPlay(state.cardState, 'white')).toBeUndefined();
    expect(() => getCardInPlay(state.cardState, 'white')).toThrow(
      'white has no card in play',
    );
  });
});
