import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { moveBothInPlayToPlayed } from './moveBothInPlayToPlayed';

/**
 * MoveBothInPlayToPlayed: visibility-preserving move of both inPlay cards to played.
 */
describe(moveBothInPlayToPlayed, () => {
  it('given authoritative, moves both inPlay to played', () => {
    const { cardState } = createEmptyGameState();
    const authoritative = {
      visibility: 'authoritative' as const,
      black: {
        ...cardState.black,
        inPlay: tempCommandCards[0],
        played: [],
      },
      white: {
        ...cardState.white,
        inPlay: tempCommandCards[1],
        played: [],
      },
    };

    const result = moveBothInPlayToPlayed(authoritative);

    expect(result.visibility).toBe('authoritative');
    expect(result.black.inPlay).toBeNull();
    expect(result.black.played).toStrictEqual([tempCommandCards[0]]);
    expect(result.white.inPlay).toBeNull();
    expect(result.white.played).toStrictEqual([tempCommandCards[1]]);
  });

  it('given whiteSeen, moves owned and hidden inPlay to played', () => {
    const { cardState } = createEmptyGameState();
    const whiteSeen = {
      visibility: 'whiteSeen' as const,
      white: {
        ...cardState.white,
        inPlay: tempCommandCards[1],
        played: [],
      },
      black: {
        awaitingPlay: 'hidden' as const,
        burnt: [],
        discarded: [],
        inHand: ['hidden' as const],
        inPlay: tempCommandCards[0],
        played: [],
      },
    };

    const result = moveBothInPlayToPlayed(whiteSeen);

    expect(result.visibility).toBe('whiteSeen');
    expect(result.white.inPlay).toBeNull();
    expect(result.white.played).toStrictEqual([tempCommandCards[1]]);
    expect(result.black.inPlay).toBeNull();
    expect(result.black.played).toStrictEqual([tempCommandCards[0]]);
  });
});
