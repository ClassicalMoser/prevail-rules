import {
  createCardState,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import { createTestCard, updateCardState } from '@testing';

import { projectGameStateForVisibility } from '../visibility';
import { replaceHiddenPlayerCardState } from './replaceHiddenPlayerCardState';
import { toHiddenCardState } from './toHiddenCardState';

/**
 * Hands are secret (§1.4): a seat holds its opponent's cards face down, and a
 * spectator holds both sides' that way. Only those face-down piles can be
 * written back as hidden; a hand the view can see is a fault to write so.
 */
describe('replaceHiddenPlayerCardState function', () => {
  // Each side holds two cards.
  const game = updateCardState(
    createEmptyGameState('standard'),
    createCardState({
      black: createOwnedCardState({
        inHand: [createTestCard(), createTestCard()],
      }),
      white: createOwnedCardState({
        inHand: [createTestCard(), createTestCard()],
      }),
    }),
  );

  // The face-down piles after one card has gone from the hand.
  const oneCardFewer = toHiddenCardState(
    createOwnedCardState({ inHand: [createTestCard()] }),
  );

  it('throws in the full record, which hides no hand', () => {
    const { cardState } = game;

    expect(() =>
      replaceHiddenPlayerCardState(cardState, 'black', oneCardFewer),
    ).toThrow('No hidden player under authoritative visibility');
    expect(() =>
      replaceHiddenPlayerCardState(cardState, 'white', oneCardFewer),
    ).toThrow('No hidden player under authoritative visibility');
  });

  it("writes Black's face-down cards at White's seat, and leaves White's", () => {
    const { cardState } = projectGameStateForVisibility(game, 'whiteSeen');

    const result = replaceHiddenPlayerCardState(
      cardState,
      'black',
      oneCardFewer,
    );

    // Black's hand is one card smaller; White's own is the same object.
    expect(result.visibility).toBe('whiteSeen');
    expect(result.black.inHand).toStrictEqual(['hidden']);
    expect(result.white).toBe(cardState.white);
  });

  it("throws for White's own hand at White's seat", () => {
    const { cardState } = projectGameStateForVisibility(game, 'whiteSeen');

    expect(() =>
      replaceHiddenPlayerCardState(cardState, 'white', oneCardFewer),
    ).toThrow('Player white is not hidden under whiteSeen visibility');
  });

  it("writes White's face-down cards at Black's seat, and leaves Black's", () => {
    const { cardState } = projectGameStateForVisibility(game, 'blackSeen');

    const result = replaceHiddenPlayerCardState(
      cardState,
      'white',
      oneCardFewer,
    );

    // White's hand is one card smaller; Black's own is the same object.
    expect(result.visibility).toBe('blackSeen');
    expect(result.white.inHand).toStrictEqual(['hidden']);
    expect(result.black).toBe(cardState.black);
  });

  it("throws for Black's own hand at Black's seat", () => {
    const { cardState } = projectGameStateForVisibility(game, 'blackSeen');

    expect(() =>
      replaceHiddenPlayerCardState(cardState, 'black', oneCardFewer),
    ).toThrow('Player black is not hidden under blackSeen visibility');
  });

  it('writes either side for a spectator, and leaves the other', () => {
    const { cardState } = projectGameStateForVisibility(game, 'spectator');

    const withBlack = replaceHiddenPlayerCardState(
      cardState,
      'black',
      oneCardFewer,
    );
    const withWhite = replaceHiddenPlayerCardState(
      cardState,
      'white',
      oneCardFewer,
    );

    // A spectator holds both hands face down, so either can be written.
    expect(withBlack.visibility).toBe('spectator');
    expect(withBlack.black.inHand).toStrictEqual(['hidden']);
    expect(withBlack.white).toBe(cardState.white);
    expect(withWhite.white.inHand).toStrictEqual(['hidden']);
    expect(withWhite.black).toBe(cardState.black);
  });

  it('throws for a visibility the game does not know', () => {
    expect(() =>
      replaceHiddenPlayerCardState(
        // A visibility the type forbids, to reach the exhaustive default.
        { ...game.cardState, visibility: 'nobody' } as never,
        'black',
        oneCardFewer,
      ),
    ).toThrow('Invalid card state:');
  });
});
