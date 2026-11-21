import { tempCommandCards } from '@sampleValues';
import type { AuthoritativeGameState } from '@game';
import { gameStateSchema } from '@game';

import { projectGameStateForVisibility } from './projectGameStateForVisibility';

import { createEmptyGameState } from '@factories';

function authoritativeState(): AuthoritativeGameState {
  const gameState = createEmptyGameState('standard');
  return {
    ...gameState,
    cardState: {
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
    },
  };
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

    expect(projected.cardState.visibility).toBe('whiteSeen');
    expect(projected.cardState.white.inHand).toStrictEqual([
      tempCommandCards[3],
      tempCommandCards[4],
    ]);
    expect(projected.cardState.black).toStrictEqual({
      awaitingPlay: 'hidden',
      burnt: [],
      discarded: [],
      inHand: ['hidden'],
      inPlay: null,
      played: [],
    });
    expect(projected.cardState.white.discarded).toStrictEqual([
      tempCommandCards[2],
    ]);
  });

  it('projects blackSeen with black owned and white hidden', () => {
    const projected = projectGameStateForVisibility(
      authoritativeState(),
      'blackSeen',
    );

    expect(projected.cardState.visibility).toBe('blackSeen');
    expect(projected.cardState.black.awaitingPlay).toBe(tempCommandCards[0]);
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

    expect(projected.cardState.visibility).toBe('spectator');
    expect(projected.cardState.white.inHand).toStrictEqual([
      'hidden',
      'hidden',
    ]);
    expect(projected.cardState.black.inHand).toStrictEqual(['hidden']);
    expect(projected.cardState.black.awaitingPlay).toBe('hidden');
    expect(projected.cardState.white.awaitingPlay).toBeNull();
    expect(projected.cardState.white.discarded).toStrictEqual([
      tempCommandCards[2],
    ]);
    // The board is never hidden.
    expect(projected.boardState).toBe(state.boardState);
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
