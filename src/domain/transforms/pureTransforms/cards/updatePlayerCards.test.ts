import type { HiddenCardState, OwnedCardState } from '@game';
import { createTestCard, updateCardState } from '@testing';

import { projectGameStateForVisibility } from '../visibility';
import { updatePlayerCards } from './updatePlayerCards';

import {
  createCardState,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';

/**
 * Every seat applies the same event, so a player's cards change differently
 * for each: seen where the seat can read the hand, counted where it cannot
 * (§4.1.2).
 *
 * TODO(misleading): §4.1.2 is the reveal of both played cards; that a hand
 * is secret is §1.4. Settle by citing §1.4.
 */
describe('updatePlayerCards function', () => {
  const card = createTestCard();
  // Black holds one card; White holds another.
  const authoritative = updateCardState(
    createEmptyGameState('standard'),
    createCardState({
      black: createOwnedCardState({ inHand: [card] }),
      white: createOwnedCardState({ inHand: [createTestCard()] }),
    }),
  );

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
    const state = projectGameStateForVisibility(authoritative, 'whiteSeen');

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
