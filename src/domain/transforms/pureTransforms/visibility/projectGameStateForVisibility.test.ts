import { tempCommandCards } from '@sampleValues';
import type { AuthoritativeGameState } from '@game';
import { gameStateSchema } from '@game';
import { createEmptyGameState } from '@factories';
import { updateCardState } from '@testing';

import { projectGameStateForVisibility } from './projectGameStateForVisibility';

/**
 * The server's record with a card in every place a view treats differently:
 * black's hand and the card black is waiting to play, which are private, and
 * white's hand beside a public discard. Five different cards, one in each
 * place.
 */
function authoritativeState(): AuthoritativeGameState {
  const gameState = createEmptyGameState('standard');
  const withCards = updateCardState(gameState, {
    visibility: 'authoritative',
    black: {
      awaitingPlay: tempCommandCards[0],
      burnt: [],
      discarded: [],
      inHand: [tempCommandCards[1]],
      inPlay: null,
      played: [],
    },
    white: {
      awaitingPlay: null,
      burnt: [],
      discarded: [tempCommandCards[2]],
      inHand: [tempCommandCards[3], tempCommandCards[4]],
      inPlay: null,
      played: [],
    },
  });

  // The record, every card face up.
  return withCards;
}

describe('projectGameStateForVisibility function', () => {
  it('keeps both hands in the authoritative view', () => {
    // The server's own record, with a card in each hand and one awaiting play.
    const state = authoritativeState();
    const projected = projectGameStateForVisibility(state, 'authoritative');

    // Nothing is turned face down: both hands and the awaiting card are read.
    expect(projected.cardState.visibility).toBe('authoritative');
    expect(projected.cardState.black.inHand).toStrictEqual([
      tempCommandCards[1],
    ]);
    expect(projected.cardState.black.awaitingPlay).toBe(tempCommandCards[0]);
    expect(projected.cardState.white.inHand).toStrictEqual([
      tempCommandCards[3],
      tempCommandCards[4],
    ]);
  });

  it('projects whiteSeen with white owned and black hidden', () => {
    const projected = projectGameStateForVisibility(
      authoritativeState(),
      'whiteSeen',
    );

    // White reads its own hand.
    expect(projected.cardState.visibility).toBe('whiteSeen');
    expect(projected.cardState.white.inHand).toStrictEqual([
      tempCommandCards[3],
      tempCommandCards[4],
    ]);
    // Black's hand and the card black laid down are face down, one hidden
    // card for each, so white knows how many but not which (§4.1.1).
    expect(projected.cardState.black).toStrictEqual({
      awaitingPlay: 'hidden',
      burnt: [],
      discarded: [],
      inHand: ['hidden'],
      inPlay: null,
      played: [],
    });
    // White's own discard is public anyway, and stays in view.
    expect(projected.cardState.white.discarded).toStrictEqual([
      tempCommandCards[2],
    ]);
  });

  it('projects blackSeen with black owned and white hidden', () => {
    const projected = projectGameStateForVisibility(
      authoritativeState(),
      'blackSeen',
    );

    // Black reads the card it laid down.
    expect(projected.cardState.visibility).toBe('blackSeen');
    expect(projected.cardState.black.awaitingPlay).toBe(tempCommandCards[0]);
    // White's hand is face down; white's discard, being public, is not.
    expect(projected.cardState.white.inHand).toStrictEqual([
      'hidden',
      'hidden',
    ]);
    expect(projected.cardState.white.discarded).toStrictEqual([
      tempCommandCards[2],
    ]);
  });

  it('projects spectator with both hands hidden and public piles intact', () => {
    const state = authoritativeState();
    const projected = projectGameStateForVisibility(state, 'spectator');

    // A spectator holds neither hand: both are face down, and so is the
    // card black laid down. White has laid none, and nothing is invented.
    expect(projected.cardState.visibility).toBe('spectator');
    expect(projected.cardState.white.inHand).toStrictEqual([
      'hidden',
      'hidden',
    ]);
    expect(projected.cardState.black.inHand).toStrictEqual(['hidden']);
    expect(projected.cardState.black.awaitingPlay).toBe('hidden');
    expect(projected.cardState.white.awaitingPlay).toBeNull();
    // The discard is public, so it stays in view.
    expect(projected.cardState.white.discarded).toStrictEqual([
      tempCommandCards[2],
    ]);
    // The board is never hidden.
    expect(projected.boardState).toBe(state.boardState);
  });

  it('throws for a view that is not one of the four', () => {
    // No caller can name another view; one is forced through to reach the
    // guard.
    const view = 'opponent' as never; // a view the type rules out

    expect(() =>
      projectGameStateForVisibility(authoritativeState(), view),
    ).toThrow('Invalid visibility: opponent');
  });
});

/**
 * A projected state says which view it is, and holds the cards that view may
 * read. The game state schema fixes the two together, so a state cannot
 * claim to be one view while carrying another's cards.
 */
describe('a projected game state, read back by the game state schema', () => {
  it('is a game state in every view, and says which', () => {
    // The server's record, projected for itself, each seat and a spectator.
    const state = authoritativeState();

    for (const view of [
      'authoritative',
      'whiteSeen',
      'blackSeen',
      'spectator',
    ] as const) {
      const projected = projectGameStateForVisibility(state, view);

      // Each projection is a game state, tagged with its own view.
      expect(gameStateSchema.safeParse(projected).success).toBe(true);
      expect(projected.visibility).toBe(view);
    }
  });

  it('is refused when it claims a seat’s view but holds the full record’s cards', () => {
    // The full record, tagged as white's seat: both hands are in view.
    const state = authoritativeState();

    // Refused: the tag and the cards must name the same view.
    expect(
      gameStateSchema.safeParse({ ...state, visibility: 'whiteSeen' }).success,
    ).toBe(false);
  });

  it('is refused without its view tag', () => {
    // The full record with its tag taken off.
    const { visibility: _visibility, ...untagged } = authoritativeState();

    // Refused: without the tag there is no telling which view it is.
    expect(gameStateSchema.safeParse(untagged).success).toBe(false);
  });
});
