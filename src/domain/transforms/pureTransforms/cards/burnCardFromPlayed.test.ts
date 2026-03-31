import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { burnCardFromPlayed } from './burnCardFromPlayed';

/**
 * burnCardFromPlayed: Burns a specific card from the player's played pile.
 */
describe('burnCardFromPlayed', () => {
  it('given move card from played to burnt', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        played: [tempCommandCards[0], tempCommandCards[1]],
        burnt: [],
      },
    };

    const newCardState = burnCardFromPlayed(
      cardState,
      'black',
      tempCommandCards[0],
    );

    expect(newCardState.black.played).toEqual([tempCommandCards[1]]);
    expect(newCardState.black.burnt).toEqual([tempCommandCards[0]]);
    expect(newCardState.white).toBe(cardState.white);
  });

  it('given if card is not in played pile, throws', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        played: [tempCommandCards[0]],
        burnt: [],
      },
    };

    expect(() =>
      burnCardFromPlayed(cardState, 'black', tempCommandCards[1]),
    ).toThrow(
      `Card ${tempCommandCards[1].id} not found in black player's played cards`,
    );
  });

  it('given not mutate the original card state', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        played: [tempCommandCards[0]],
        burnt: [],
      },
    };
    const originalPlayed = cardState.black.played;
    const originalBurnt = cardState.black.burnt;

    burnCardFromPlayed(cardState, 'black', tempCommandCards[0]);

    expect(cardState.black.played).toBe(originalPlayed);
    expect(cardState.black.burnt).toBe(originalBurnt);
  });

  it('given append to existing burnt cards', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        played: [tempCommandCards[0], tempCommandCards[1]],
        burnt: [tempCommandCards[2]],
      },
    };

    const newCardState = burnCardFromPlayed(
      cardState,
      'black',
      tempCommandCards[0],
    );

    expect(newCardState.black.burnt).toEqual([
      tempCommandCards[2],
      tempCommandCards[0],
    ]);
  });
});
