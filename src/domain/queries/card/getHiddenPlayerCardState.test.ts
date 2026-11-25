import type { CardState } from '@game';
import {
  createCardState,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import { createTestCard, updateCardState } from '@testing';
import { projectGameStateForVisibility } from '@transforms';

import { getHiddenPlayerCardState } from './getHiddenPlayerCardState';

/**
 * A hand hidden from this view: its cards and its waiting card are face down
 * (§1.4), while the card in play stays face up for every viewer (§4.1.2).
 * Asking for the hidden side of a view that hides nothing, or for a seat's
 * own hand, is a fault.
 */
describe('getHiddenPlayerCardState function', () => {
  // Each side holds one card in hand, has another waiting face down, and a
  // third in play.
  const blackInPlay = createTestCard();
  const whiteInPlay = createTestCard();
  const game = updateCardState(
    createEmptyGameState('standard'),
    createCardState({
      black: createOwnedCardState({
        awaitingPlay: createTestCard(),
        inHand: [createTestCard()],
        inPlay: blackInPlay,
      }),
      white: createOwnedCardState({
        awaitingPlay: createTestCard(),
        inHand: [createTestCard()],
        inPlay: whiteInPlay,
      }),
    }),
  );

  it('throws in the full record, which hides no hand', () => {
    const { cardState } = game;

    expect(() => getHiddenPlayerCardState(cardState, 'black')).toThrow(
      'No hidden player under authoritative visibility',
    );
    expect(() => getHiddenPlayerCardState(cardState, 'white')).toThrow(
      'No hidden player under authoritative visibility',
    );
  });

  it("gives Black's hand face down at White's seat, its card in play still showing", () => {
    const { cardState } = projectGameStateForVisibility(game, 'whiteSeen');

    const hidden = getHiddenPlayerCardState(cardState, 'black');

    // One card in hand, shown only as a card; the waiting card face down.
    expect(hidden.inHand).toStrictEqual(['hidden']);
    expect(hidden.awaitingPlay).toBe('hidden');
    // The card in play is face up for every viewer.
    expect(hidden.inPlay).toBe(blackInPlay);
  });

  it("throws for White's own hand at White's seat", () => {
    const { cardState } = projectGameStateForVisibility(game, 'whiteSeen');

    expect(() => getHiddenPlayerCardState(cardState, 'white')).toThrow(
      'Player white is not hidden under whiteSeen visibility',
    );
  });

  it("gives White's hand face down at Black's seat, its card in play still showing", () => {
    const { cardState } = projectGameStateForVisibility(game, 'blackSeen');

    const hidden = getHiddenPlayerCardState(cardState, 'white');

    expect(hidden.inHand).toStrictEqual(['hidden']);
    expect(hidden.awaitingPlay).toBe('hidden');
    expect(hidden.inPlay).toBe(whiteInPlay);
  });

  it("throws for Black's own hand at Black's seat", () => {
    const { cardState } = projectGameStateForVisibility(game, 'blackSeen');

    expect(() => getHiddenPlayerCardState(cardState, 'black')).toThrow(
      'Player black is not hidden under blackSeen visibility',
    );
  });

  it('gives both hands face down to a spectator', () => {
    const { cardState } = projectGameStateForVisibility(game, 'spectator');

    // Black's hand, face down …
    expect(getHiddenPlayerCardState(cardState, 'black').inHand).toStrictEqual([
      'hidden',
    ]);
    // … and White's, its card in play still showing.
    const hiddenWhite = getHiddenPlayerCardState(cardState, 'white');
    expect(hiddenWhite.awaitingPlay).toBe('hidden');
    expect(hiddenWhite.inPlay).toBe(whiteInPlay);
  });

  it('throws for a visibility the game does not know', () => {
    expect(() =>
      getHiddenPlayerCardState(
        // Intentionally bad type cast to test error path
        { ...game.cardState, visibility: 'nobody' } as unknown as CardState,
        'white',
      ),
    ).toThrow('Invalid visibility: nobody');
  });
});
