import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { discardCardsFromHand } from './discardCardsFromHand';

/**
 * DiscardCardsFromHand: Pure transform to move specified cards from hand to discarded pile.
 */
describe(discardCardsFromHand, () => {
  it('given move cards from hand to discarded', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        discarded: [],
        inHand: [tempCommandCards[0], tempCommandCards[1], tempCommandCards[2]],
      },
    };

    const newCardState = discardCardsFromHand(cardState, 'black', [
      tempCommandCards[0].id,
      tempCommandCards[2].id,
    ]);

    expect(newCardState.black.inHand).toStrictEqual([tempCommandCards[1]]);
    expect(newCardState.black.discarded).toStrictEqual([
      tempCommandCards[0],
      tempCommandCards[2],
    ]);
    expect(newCardState.white).toBe(cardState.white);
  });

  it('given not mutate the original card state', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        discarded: [],
        inHand: [tempCommandCards[0], tempCommandCards[1]],
      },
    };
    const originalHand = cardState.black.inHand;
    const originalDiscarded = cardState.black.discarded;

    discardCardsFromHand(cardState, 'black', [tempCommandCards[0].id]);

    expect(cardState.black.inHand).toBe(originalHand);
    expect(cardState.black.discarded).toBe(originalDiscarded);
  });

  it('given append to existing discarded cards', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        discarded: [tempCommandCards[2]],
        inHand: [tempCommandCards[0], tempCommandCards[1]],
      },
    };

    const newCardState = discardCardsFromHand(cardState, 'black', [
      tempCommandCards[0].id,
    ]);

    expect(newCardState.black.discarded).toStrictEqual([
      tempCommandCards[2],
      tempCommandCards[0],
    ]);
  });

  it('given handle multiple cards', () => {
    const gameState = createEmptyGameState();
    const cardState = {
      ...gameState.cardState,
      black: {
        ...gameState.cardState.black,
        discarded: [],
        inHand: [tempCommandCards[0], tempCommandCards[1], tempCommandCards[2]],
      },
    };

    const newCardState = discardCardsFromHand(cardState, 'black', [
      tempCommandCards[0].id,
      tempCommandCards[1].id,
      tempCommandCards[2].id,
    ]);

    expect(newCardState.black.inHand).toStrictEqual([]);
    expect(newCardState.black.discarded).toStrictEqual([
      tempCommandCards[0],
      tempCommandCards[1],
      tempCommandCards[2],
    ]);
  });
});
