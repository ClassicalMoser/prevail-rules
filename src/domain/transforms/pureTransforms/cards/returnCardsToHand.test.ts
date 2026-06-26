import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { returnCardsToHand } from './returnCardsToHand';

/**
 * ReturnCardsToHand: Returns all played and discarded cards to the player's hand.
 */
describe(returnCardsToHand, () => {
  it('given context, returns all played and discarded cards to hand', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      discarded: [tempCommandCards[2]],
      inHand: [tempCommandCards[0]],
      played: [tempCommandCards[1]],
    };

    const result = returnCardsToHand(owned);

    expect(result.inHand).toStrictEqual([
      tempCommandCards[0],
      tempCommandCards[1],
      tempCommandCards[2],
    ]);
    expect(result.played).toStrictEqual([]);
    expect(result.discarded).toStrictEqual([]);
  });

  it('given handle empty played and discarded', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      discarded: [],
      inHand: [tempCommandCards[0]],
      played: [],
    };

    const result = returnCardsToHand(owned);

    expect(result.inHand).toStrictEqual([tempCommandCards[0]]);
    expect(result.played).toStrictEqual([]);
    expect(result.discarded).toStrictEqual([]);
  });

  it('given preserve order: hand, then played, then discarded', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      discarded: [tempCommandCards[2]],
      inHand: [tempCommandCards[0]],
      played: [tempCommandCards[1]],
    };

    const result = returnCardsToHand(owned);

    expect(result.inHand[0]).toBe(tempCommandCards[0]);
    expect(result.inHand[1]).toBe(tempCommandCards[1]);
    expect(result.inHand[2]).toBe(tempCommandCards[2]);
  });

  it('given not mutate the original card state', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      discarded: [tempCommandCards[2]],
      inHand: [tempCommandCards[0]],
      played: [tempCommandCards[1]],
    };
    const originalHand = owned.inHand;
    const originalPlayed = owned.played;
    const originalDiscarded = owned.discarded;

    returnCardsToHand(owned);

    expect(owned.inHand).toBe(originalHand);
    expect(owned.played).toBe(originalPlayed);
    expect(owned.discarded).toBe(originalDiscarded);
  });
});
