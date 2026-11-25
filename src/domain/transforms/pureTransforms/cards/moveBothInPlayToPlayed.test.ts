import {
  createCardState,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import { createTestCard, updateCardState } from '@testing';

import { projectGameStateForVisibility } from '../visibility';
import { moveBothInPlayToPlayed } from './moveBothInPlayToPlayed';

/**
 * Cleanup opens with both players putting this round's card onto their
 * played pile (§4.5.1). The card in play is face up, so every view moves
 * both, whether or not it can see the hands.
 */
describe('moveBothInPlayToPlayed function', () => {
  // Each side has a card in play, one in hand, and one played in an earlier
  // round.
  const blackInPlay = createTestCard();
  const whiteInPlay = createTestCard();
  const blackPlayedEarlier = createTestCard();
  const whitePlayedEarlier = createTestCard();
  const game = updateCardState(
    createEmptyGameState('standard'),
    createCardState({
      black: createOwnedCardState({
        inHand: [createTestCard()],
        inPlay: blackInPlay,
        played: [blackPlayedEarlier],
      }),
      white: createOwnedCardState({
        inHand: [createTestCard()],
        inPlay: whiteInPlay,
        played: [whitePlayedEarlier],
      }),
    }),
  );

  it('moves both cards in play onto the played piles in the full record', () => {
    const result = moveBothInPlayToPlayed(game.cardState);

    // The view is kept, and each card in play goes on top of its pile.
    expect(result.visibility).toBe('authoritative');
    expect(result.black.inPlay).toBeNull();
    expect(result.black.played).toStrictEqual([
      blackPlayedEarlier,
      blackInPlay,
    ]);
    expect(result.white.inPlay).toBeNull();
    expect(result.white.played).toStrictEqual([
      whitePlayedEarlier,
      whiteInPlay,
    ]);
  });

  it("moves both cards in play at White's seat, Black's hand still face down", () => {
    const { cardState } = projectGameStateForVisibility(game, 'whiteSeen');

    const result = moveBothInPlayToPlayed(cardState);

    // White's own card and Black's face-up card both move.
    expect(result.visibility).toBe('whiteSeen');
    expect(result.white.played).toStrictEqual([
      whitePlayedEarlier,
      whiteInPlay,
    ]);
    expect(result.black.inPlay).toBeNull();
    expect(result.black.played).toStrictEqual([
      blackPlayedEarlier,
      blackInPlay,
    ]);
    // Black's hand stays face down.
    expect(result.black.inHand).toStrictEqual(['hidden']);
  });

  it("moves both cards in play at Black's seat, White's hand still face down", () => {
    const { cardState } = projectGameStateForVisibility(game, 'blackSeen');

    const result = moveBothInPlayToPlayed(cardState);

    // Black's own card and White's face-up card both move.
    expect(result.visibility).toBe('blackSeen');
    expect(result.black.played).toStrictEqual([
      blackPlayedEarlier,
      blackInPlay,
    ]);
    expect(result.white.inPlay).toBeNull();
    expect(result.white.played).toStrictEqual([
      whitePlayedEarlier,
      whiteInPlay,
    ]);
    // White's hand stays face down.
    expect(result.white.inHand).toStrictEqual(['hidden']);
  });

  it('moves both cards in play for a spectator, who sees neither hand', () => {
    const { cardState } = projectGameStateForVisibility(game, 'spectator');

    const result = moveBothInPlayToPlayed(cardState);

    // Both cards in play are face up, so both move.
    expect(result.visibility).toBe('spectator');
    expect(result.black.played).toStrictEqual([
      blackPlayedEarlier,
      blackInPlay,
    ]);
    expect(result.white.played).toStrictEqual([
      whitePlayedEarlier,
      whiteInPlay,
    ]);
    // Both hands stay face down.
    expect(result.black.inHand).toStrictEqual(['hidden']);
    expect(result.white.inHand).toStrictEqual(['hidden']);
  });

  it('throws for a visibility the game does not know', () => {
    expect(() =>
      moveBothInPlayToPlayed(
        // A visibility the type forbids, to reach the exhaustive default.
        { ...game.cardState, visibility: 'nobody' } as never,
      ),
    ).toThrow('Invalid card state:');
  });
});
