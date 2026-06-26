import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { discardCardsFromHand } from './discardCardsFromHand';

/**
 * DiscardCardsFromHand: Pure transform to move specified cards from hand to discarded pile.
 */
describe(discardCardsFromHand, () => {
  it('given move cards from hand to discarded', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      discarded: [],
      inHand: [tempCommandCards[0], tempCommandCards[1], tempCommandCards[2]],
    };

    const result = discardCardsFromHand(owned, [
      tempCommandCards[0].id,
      tempCommandCards[2].id,
    ]);

    expect(result.inHand).toStrictEqual([tempCommandCards[1]]);
    expect(result.discarded).toStrictEqual([
      tempCommandCards[0],
      tempCommandCards[2],
    ]);
  });

  it('given not mutate the original card state', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      discarded: [],
      inHand: [tempCommandCards[0], tempCommandCards[1]],
    };
    const originalHand = owned.inHand;
    const originalDiscarded = owned.discarded;

    discardCardsFromHand(owned, [tempCommandCards[0].id]);

    expect(owned.inHand).toBe(originalHand);
    expect(owned.discarded).toBe(originalDiscarded);
  });

  it('given append to existing discarded cards', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      discarded: [tempCommandCards[2]],
      inHand: [tempCommandCards[0], tempCommandCards[1]],
    };

    const result = discardCardsFromHand(owned, [tempCommandCards[0].id]);

    expect(result.discarded).toStrictEqual([
      tempCommandCards[2],
      tempCommandCards[0],
    ]);
  });

  it('given handle multiple cards', () => {
    const owned = {
      ...createEmptyGameState().cardState.black,
      discarded: [],
      inHand: [tempCommandCards[0], tempCommandCards[1], tempCommandCards[2]],
    };

    const result = discardCardsFromHand(owned, [
      tempCommandCards[0].id,
      tempCommandCards[1].id,
      tempCommandCards[2].id,
    ]);

    expect(result.inHand).toStrictEqual([]);
    expect(result.discarded).toStrictEqual([
      tempCommandCards[0],
      tempCommandCards[1],
      tempCommandCards[2],
    ]);
  });
});
