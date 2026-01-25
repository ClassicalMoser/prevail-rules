import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { discardCardsFromHand } from './discardCardsFromHand';

describe('discardCardsFromHand', () => {
  it('should move cards from hand to discarded', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [commandCards[0], commandCards[1], commandCards[2]],
        discarded: [],
      },
    };

    const newCardState = discardCardsFromHand(cardState, 'black', [
      commandCards[0].id,
      commandCards[2].id,
    ]);

    expect(newCardState.black.inHand).toEqual([commandCards[1]]);
    expect(newCardState.black.discarded).toEqual([
      commandCards[0],
      commandCards[2],
    ]);
    expect(newCardState.white).toBe(cardState.white);
  });

  it('should not mutate the original card state', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [commandCards[0], commandCards[1]],
        discarded: [],
      },
    };
    const originalHand = cardState.black.inHand;
    const originalDiscarded = cardState.black.discarded;

    discardCardsFromHand(cardState, 'black', [commandCards[0].id]);

    expect(cardState.black.inHand).toBe(originalHand);
    expect(cardState.black.discarded).toBe(originalDiscarded);
  });

  it('should append to existing discarded cards', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [commandCards[0], commandCards[1]],
        discarded: [commandCards[2]],
      },
    };

    const newCardState = discardCardsFromHand(cardState, 'black', [
      commandCards[0].id,
    ]);

    expect(newCardState.black.discarded).toEqual([
      commandCards[2],
      commandCards[0],
    ]);
  });

  it('should handle multiple cards', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        inHand: [commandCards[0], commandCards[1], commandCards[2]],
        discarded: [],
      },
    };

    const newCardState = discardCardsFromHand(cardState, 'black', [
      commandCards[0].id,
      commandCards[1].id,
      commandCards[2].id,
    ]);

    expect(newCardState.black.inHand).toEqual([]);
    expect(newCardState.black.discarded).toEqual([
      commandCards[0],
      commandCards[1],
      commandCards[2],
    ]);
  });
});
