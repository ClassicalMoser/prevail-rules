import {
  createCardState,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import { createTestCard, updateCardState } from '@testing';

import { projectGameStateForVisibility } from '../visibility';
import { replaceOwnedPlayerCardState } from './replaceOwnedPlayerCardState';

/**
 * A hand is in view to the full record and to its owner's seat (§1.4). Only
 * those hands can be written back as seen; a face-down hand is a fault to
 * write so.
 */
describe('replaceOwnedPlayerCardState function', () => {
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

  // The piles after all but one card has gone from the hand.
  const keptCard = createTestCard();
  const oneCardLeft = createOwnedCardState({ inHand: [keptCard] });

  it('writes either side in the full record, and leaves the other', () => {
    const { cardState } = game;

    const withBlack = replaceOwnedPlayerCardState(
      cardState,
      'black',
      oneCardLeft,
    );
    const withWhite = replaceOwnedPlayerCardState(
      cardState,
      'white',
      oneCardLeft,
    );

    // The full record holds both hands, so either can be written.
    expect(withBlack.visibility).toBe('authoritative');
    expect(withBlack.black.inHand).toStrictEqual([keptCard]);
    expect(withBlack.white).toBe(cardState.white);
    expect(withWhite.white.inHand).toStrictEqual([keptCard]);
    expect(withWhite.black).toBe(cardState.black);
  });

  it("writes White's own cards at White's seat, and leaves Black's face down", () => {
    const { cardState } = projectGameStateForVisibility(game, 'whiteSeen');

    const result = replaceOwnedPlayerCardState(cardState, 'white', oneCardLeft);

    expect(result.visibility).toBe('whiteSeen');
    expect(result.white.inHand).toStrictEqual([keptCard]);
    expect(result.black).toBe(cardState.black);
  });

  it("throws for Black's hand at White's seat", () => {
    const { cardState } = projectGameStateForVisibility(game, 'whiteSeen');

    expect(() =>
      replaceOwnedPlayerCardState(cardState, 'black', oneCardLeft),
    ).toThrow('Player black is not owned under whiteSeen visibility');
  });

  it("writes Black's own cards at Black's seat, and leaves White's face down", () => {
    const { cardState } = projectGameStateForVisibility(game, 'blackSeen');

    const result = replaceOwnedPlayerCardState(cardState, 'black', oneCardLeft);

    expect(result.visibility).toBe('blackSeen');
    expect(result.black.inHand).toStrictEqual([keptCard]);
    expect(result.white).toBe(cardState.white);
  });

  it("throws for White's hand at Black's seat", () => {
    const { cardState } = projectGameStateForVisibility(game, 'blackSeen');

    expect(() =>
      replaceOwnedPlayerCardState(cardState, 'white', oneCardLeft),
    ).toThrow('Player white is not owned under blackSeen visibility');
  });

  it('throws for either side for a spectator, who sees neither hand', () => {
    const { cardState } = projectGameStateForVisibility(game, 'spectator');

    expect(() =>
      replaceOwnedPlayerCardState(cardState, 'black', oneCardLeft),
    ).toThrow('Player black is not owned under spectator visibility');
    expect(() =>
      replaceOwnedPlayerCardState(cardState, 'white', oneCardLeft),
    ).toThrow('Player white is not owned under spectator visibility');
  });

  it('throws for a visibility the game does not know', () => {
    expect(() =>
      replaceOwnedPlayerCardState(
        // A visibility the type forbids, to reach the exhaustive default.
        { ...game.cardState, visibility: 'nobody' } as never,
        'black',
        oneCardLeft,
      ),
    ).toThrow('Invalid card state:');
  });
});
