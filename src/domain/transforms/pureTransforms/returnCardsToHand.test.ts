import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { returnCardsToHand } from './returnCardsToHand';

describe('returnCardsToHand', () => {
  it('should return all played and discarded cards to hand', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [commandCards[0]],
        played: [commandCards[1]],
        discarded: [commandCards[2]],
      },
    };

    const newCardState = returnCardsToHand(cardState, 'black');

    expect(newCardState.black.inHand).toEqual([
      commandCards[0],
      commandCards[1],
      commandCards[2],
    ]);
    expect(newCardState.black.played).toEqual([]);
    expect(newCardState.black.discarded).toEqual([]);
    expect(newCardState.white).toBe(cardState.white);
  });

  it('should handle empty played and discarded', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [commandCards[0]],
        played: [],
        discarded: [],
      },
    };

    const newCardState = returnCardsToHand(cardState, 'black');

    expect(newCardState.black.inHand).toEqual([commandCards[0]]);
    expect(newCardState.black.played).toEqual([]);
    expect(newCardState.black.discarded).toEqual([]);
  });

  it('should preserve order: hand, then played, then discarded', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [commandCards[0]],
        played: [commandCards[1]],
        discarded: [commandCards[2]],
      },
    };

    const newCardState = returnCardsToHand(cardState, 'black');

    expect(newCardState.black.inHand[0]).toBe(commandCards[0]);
    expect(newCardState.black.inHand[1]).toBe(commandCards[1]);
    expect(newCardState.black.inHand[2]).toBe(commandCards[2]);
  });

  it('should not mutate the original card state', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [commandCards[0]],
        played: [commandCards[1]],
        discarded: [commandCards[2]],
      },
    };
    const originalHand = cardState.black.inHand;
    const originalPlayed = cardState.black.played;
    const originalDiscarded = cardState.black.discarded;

    returnCardsToHand(cardState, 'black');

    expect(cardState.black.inHand).toBe(originalHand);
    expect(cardState.black.played).toBe(originalPlayed);
    expect(cardState.black.discarded).toBe(originalDiscarded);
  });
});
