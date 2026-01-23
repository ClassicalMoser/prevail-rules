import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { moveCardToPlayed } from './moveCardToPlayed';

describe('moveCardToPlayed', () => {
  it('should move card from inPlay to played', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inPlay: commandCards[0],
        played: [],
      },
    };

    const newCardState = moveCardToPlayed(cardState, 'black');

    expect(newCardState.black.inPlay).toBeNull();
    expect(newCardState.black.played).toEqual([commandCards[0]]);
    expect(newCardState.white).toBe(cardState.white);
  });

  it('should append to existing played cards', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inPlay: commandCards[1],
        played: [commandCards[0]],
      },
    };

    const newCardState = moveCardToPlayed(cardState, 'black');

    expect(newCardState.black.played).toEqual([commandCards[0], commandCards[1]]);
  });

  it('should return unchanged state if no card in play', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inPlay: null,
        played: [],
      },
    };

    const newCardState = moveCardToPlayed(cardState, 'black');

    expect(newCardState).toBe(cardState);
    expect(newCardState.black.inPlay).toBeNull();
    expect(newCardState.black.played).toEqual([]);
  });

  it('should not mutate the original card state', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inPlay: commandCards[0],
        played: [],
      },
    };
    const originalInPlay = cardState.black.inPlay;
    const originalPlayed = cardState.black.played;

    moveCardToPlayed(cardState, 'black');

    expect(cardState.black.inPlay).toBe(originalInPlay);
    expect(cardState.black.played).toBe(originalPlayed);
  });
});
