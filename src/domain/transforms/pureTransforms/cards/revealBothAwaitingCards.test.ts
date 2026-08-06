import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { revealBothAwaitingCards } from './revealBothAwaitingCards';

/**
 * RevealBothAwaitingCards: visibility-preserving reveal of both awaitingPlay slots.
 */
describe(revealBothAwaitingCards, () => {
  const revealed = {
    black: tempCommandCards[0],
    white: tempCommandCards[1],
  };

  it('given authoritative, reveals both owned awaitingPlay slots from state', () => {
    const { cardState } = createEmptyGameState();
    const authoritative = {
      visibility: 'authoritative' as const,
      black: {
        ...cardState.black,
        awaitingPlay: tempCommandCards[0],
        inPlay: null,
      },
      white: {
        ...cardState.white,
        awaitingPlay: tempCommandCards[1],
        inPlay: null,
      },
    };

    const result = revealBothAwaitingCards(authoritative, revealed);

    expect(result.visibility).toBe('authoritative');
    expect(result.black.inPlay).toBe(tempCommandCards[0]);
    expect(result.black.awaitingPlay).toBeNull();
    expect(result.white.inPlay).toBe(tempCommandCards[1]);
    expect(result.white.awaitingPlay).toBeNull();
  });

  it('given whiteSeen, reveals owned white from state and black from payload', () => {
    const { cardState } = createEmptyGameState();
    const whiteSeen = {
      visibility: 'whiteSeen' as const,
      white: {
        ...cardState.white,
        awaitingPlay: tempCommandCards[1],
        inPlay: null,
      },
      black: {
        awaitingPlay: 'hidden' as const,
        burnt: [],
        discarded: [],
        inHand: ['hidden' as const],
        inPlay: null,
        played: [],
      },
    };

    const result = revealBothAwaitingCards(whiteSeen, revealed);

    expect(result.visibility).toBe('whiteSeen');
    expect(result.white.inPlay).toBe(tempCommandCards[1]);
    expect(result.white.awaitingPlay).toBeNull();
    expect(result.black.inPlay).toBe(revealed.black);
    expect(result.black.awaitingPlay).toBeNull();
  });

  it('given blackSeen, reveals owned black from state and white from payload', () => {
    const { cardState } = createEmptyGameState();
    const blackSeen = {
      visibility: 'blackSeen' as const,
      black: {
        ...cardState.black,
        awaitingPlay: tempCommandCards[0],
        inPlay: null,
      },
      white: {
        awaitingPlay: 'hidden' as const,
        burnt: [],
        discarded: [],
        inHand: ['hidden' as const],
        inPlay: null,
        played: [],
      },
    };

    const result = revealBothAwaitingCards(blackSeen, revealed);

    expect(result.visibility).toBe('blackSeen');
    expect(result.black.inPlay).toBe(tempCommandCards[0]);
    expect(result.black.awaitingPlay).toBeNull();
    expect(result.white.inPlay).toBe(revealed.white);
    expect(result.white.awaitingPlay).toBeNull();
  });
});
