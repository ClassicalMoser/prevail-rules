import { createTestCard, updateCardState } from '@testing';

import { haveBothPlayersChosenCards } from './haveBothPlayersChosenCards';

import { createEmptyGameState } from '@factories';

/** Both players choose at once, and the cards are revealed together (§4.1.1). */
describe('haveBothPlayersChosenCards function', () => {
  const base = createEmptyGameState('standard');
  const card = createTestCard();

  it('is false until each player has a card waiting', () => {
    expect(haveBothPlayersChosenCards(base.cardState)).toBe(false);

    const oneChosen = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, awaitingPlay: card },
    });
    expect(haveBothPlayersChosenCards(oneChosen.cardState)).toBe(false);
  });

  it('is true once both have chosen', () => {
    const bothChosen = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, awaitingPlay: card },
      white: { ...base.cardState.white, awaitingPlay: card },
    });

    expect(haveBothPlayersChosenCards(bothChosen.cardState)).toBe(true);
  });
});
