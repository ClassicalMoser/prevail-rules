import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { burnCardFromPlayed } from './burnCardFromPlayed';

describe('burnCardFromPlayed', () => {
  it('should move card from played to burnt', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        played: [commandCards[0], commandCards[1]],
        burnt: [],
      },
    };

    const newCardState = burnCardFromPlayed(cardState, 'black', commandCards[0]);

    expect(newCardState.black.played).toEqual([commandCards[1]]);
    expect(newCardState.black.burnt).toEqual([commandCards[0]]);
    expect(newCardState.white).toBe(cardState.white);
  });

  it('should throw if card is not in played pile', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        played: [commandCards[0]],
        burnt: [],
      },
    };

    expect(() =>
      burnCardFromPlayed(cardState, 'black', commandCards[1]),
    ).toThrow("Card 2 not found in black player's played cards");
  });

  it('should not mutate the original card state', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        played: [commandCards[0]],
        burnt: [],
      },
    };
    const originalPlayed = cardState.black.played;
    const originalBurnt = cardState.black.burnt;

    burnCardFromPlayed(cardState, 'black', commandCards[0]);

    expect(cardState.black.played).toBe(originalPlayed);
    expect(cardState.black.burnt).toBe(originalBurnt);
  });

  it('should append to existing burnt cards', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        played: [commandCards[0], commandCards[1]],
        burnt: [commandCards[2]],
      },
    };

    const newCardState = burnCardFromPlayed(cardState, 'black', commandCards[0]);

    expect(newCardState.black.burnt).toEqual([commandCards[2], commandCards[0]]);
  });
});
