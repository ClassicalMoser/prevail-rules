import type { CardState, HiddenCardState, OwnedCardState } from '@game';
import { createTestCard } from '@testing';

import { replaceCardState } from './replaceCardState';
import { toHiddenCardState } from './toHiddenCardState';
import { updatePlayerCards } from './updatePlayerCards';

import { createEmptyGameState } from '@factories';

/**
 * Every seat applies the same event, so a player's cards change differently
 * for each: seen where the seat can read the hand, counted where it cannot
 * (§4.1.2).
 */
describe('updatePlayerCards function', () => {
  const card = createTestCard();
  const base = createEmptyGameState('standard');
  const authoritative = replaceCardState(base, {
    ...base.cardState,
    black: { ...base.cardState.black, inHand: [card] },
  });

  /**
   * Marks which fold ran, so the spec can say which way a seat was read: the
   * seen fold burns one card, and the counted fold burns two.
   */
  const change = {
    hidden: (cards: HiddenCardState): HiddenCardState => ({
      ...cards,
      burnt: [card, card],
    }),
    owned: (cards: OwnedCardState): OwnedCardState => ({
      ...cards,
      burnt: [card],
    }),
  };

  it('changes the cards as seen where the full record holds them', () => {
    const next = updatePlayerCards(authoritative, 'black', change);

    expect(next.cardState.black.burnt).toStrictEqual([card]);
  });

  it('changes the cards as counted where the seat cannot see the hand', () => {
    // White's seat holds white's cards in full and black's only as a count.
    const whiteSeen: CardState = {
      black: toHiddenCardState(authoritative.cardState.black),
      visibility: 'whiteSeen',
      white: authoritative.cardState.white,
    };
    const state = replaceCardState(authoritative, whiteSeen);

    const forBlack = updatePlayerCards(state, 'black', change);
    const forWhite = updatePlayerCards(state, 'white', change);

    expect(forBlack.cardState.black.burnt).toStrictEqual([card, card]);
    expect(forWhite.cardState.white.burnt).toStrictEqual([card]);
  });

  it('keeps the other player’s cards as they were', () => {
    const next = updatePlayerCards(authoritative, 'black', change);

    expect(next.cardState.white).toBe(authoritative.cardState.white);
  });
});
