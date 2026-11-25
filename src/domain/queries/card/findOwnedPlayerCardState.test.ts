import {
  createCardState,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import { createTestCard, updateCardState } from '@testing';
import { projectGameStateForVisibility } from '@transforms';

import { findOwnedPlayerCardState } from './findOwnedPlayerCardState';

/**
 * Hands are secret (§1.4): each seat sees its own and only the size of the
 * other's, and a spectator sees neither. Whether a hand is in view is an
 * ordinary question for a seated client, so a hidden one answers undefined.
 */
describe('findOwnedPlayerCardState function', () => {
  // Each side holds one card in hand and has another waiting face down.
  const game = updateCardState(
    createEmptyGameState('standard'),
    createCardState({
      black: createOwnedCardState({
        awaitingPlay: createTestCard(),
        inHand: [createTestCard()],
      }),
      white: createOwnedCardState({
        awaitingPlay: createTestCard(),
        inHand: [createTestCard()],
      }),
    }),
  );

  it('finds either hand in the full record', () => {
    // The full record hides nothing.
    const { cardState } = game;

    expect(findOwnedPlayerCardState(cardState, 'white')).toBe(cardState.white);
    expect(findOwnedPlayerCardState(cardState, 'black')).toBe(cardState.black);
  });

  it("finds a seat's own hand", () => {
    // White's seat sees its own cards.
    const { cardState } = projectGameStateForVisibility(game, 'whiteSeen');

    expect(findOwnedPlayerCardState(cardState, 'white')).toBe(
      game.cardState.white,
    );
  });

  it("answers undefined for the opponent's hand at a seat", () => {
    // Black's cards are hidden from white's seat, which is ordinary, not a
    // fault: white can still refuse a commitment it is asked for.
    const { cardState } = projectGameStateForVisibility(game, 'whiteSeen');

    expect(findOwnedPlayerCardState(cardState, 'black')).toBeUndefined();
  });

  it("answers undefined for White's hand at Black's seat", () => {
    // The same from the other side of the table.
    const { cardState } = projectGameStateForVisibility(game, 'blackSeen');

    expect(findOwnedPlayerCardState(cardState, 'white')).toBeUndefined();
    // Black's own hand is in view there.
    expect(findOwnedPlayerCardState(cardState, 'black')).toBe(
      game.cardState.black,
    );
  });

  it('answers undefined for a spectator, who owns no hand', () => {
    const { cardState } = projectGameStateForVisibility(game, 'spectator');

    expect(findOwnedPlayerCardState(cardState, 'white')).toBeUndefined();
  });
});
